import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faForward from "@fortawesome/fontawesome-free-solid/faForward";

import Tracker from "../libs/Tracker";
import getSpeaker from "../libs/Speaker";
import { sleep, playSound } from "../libs/Utils";
import { sendText } from "../libs/dialogFlowV1";

import VideoDetail from "../components/VideoDetail";
import RecognitionView from "../components/RecognitionView";
import Indicator from "../components/Indicator";
import HintCard from "../components/HintCard";
import ScoreBoard from "../components/ScoreBoard";
import Avatar from "../components/Avatar";

import correct_sound from "../media/correct_answer.mp3";
import wrong_sound from "../media/wrong_answer.mp3";
import fail_sound from "../media/failed_question.mp3";

import "./LecturePanel.css";

const contentBucketURL = process.env.REACT_APP_AWS_S3_CONTENT_BUCKET_URL;

class LecturePanel extends Component {
    constructor(props) {
        super(props);
        this.videoPlayer = null;
        this.tracker = null;
        this.speechSynthesizer = getSpeaker();
        this.contexts = this.createContexts(this.props.content);

        this.correctHintRef = React.createRef();
        this.wrongHintRef = React.createRef();
        this.scoreBoardRef = React.createRef();
        this.avatarRef = React.createRef();

        this.state = {
            currentQuestionIndex: 0,
            isAsking: false,
            isWaitingAnswer: false,
            isRecording: false,
            attempt: 0,
            answers: Object.assign({}, this.props.answers),
        };
    }

    createContexts = (content) => {
        var contexts = [];
        for (const question of content.questions) {
            for (const intention of question.intentions) {
                contexts.push(intention.entityValue);
            }
        }
        return contexts;
    }

    getCurrentQuestion = () => {
        const idx = this.state.currentQuestionIndex;
        const question = this.props.content.questions[idx];
        return question;
    }

    //TODO get if unanswered
    findClosestQuestionIndex = (currentTime) => {
        const questions = this.props.content.questions;
        const times = _.map(questions, "stopTime");
        var idx = -1;
        for (var i = 0; i < times.length; i++) {
            // pick the time that is at least 1 second forward than current time
            if (times[i] > (currentTime + 1)) {
                idx = i;
                break;
            }
        }
        return idx;
    }

    destroyTracker = () => {
        if (this.tracker) {
            this.tracker.destroy();
        }
        this.tracker = null;
    }

    prepareForQuestion = (idx) => {
        const question = this.props.content.questions[idx];
        if (!question || !this.videoPlayer) {
            this.destroyTracker();
            return;
        }

        const stopTime = question.stopTime;
        if (this.tracker == null || this.tracker.stopTime !== stopTime) {
            this.destroyTracker();
            this.tracker = new Tracker(this.videoPlayer, stopTime, () => this.onTracked());
            this.tracker.start();
        }

        this.setState({ currentQuestionIndex: idx, isAsking: false, isWaitingAnswer: false, attempt: 0 });
    }

    getIndicator = () => {
        const question = this.getCurrentQuestion();

        if (!question.indicator) {
            return;
        }

        const left = question.indicator.center.x * 100;
        const top = question.indicator.center.y * 100;
        const rotate = question.indicator.angle;
        return (<Indicator left={left} top={top} rotate={rotate} />);
    }

    getScore = () => {
        const answers = this.state.answers;
        if (!answers) {
            return 0;
        }
        const states = _.map(answers, answer => answer.state);
        return states.filter(s => (s === "CORRECT")).length;
    };

    onPlayerReady = (player) => {
        this.videoPlayer = player;
    }

    onPlayerStateChange = (event) => {
        if (event.data === 1) { // Started playing
            const currentTime = event.target.getCurrentTime();
            const idx = this.findClosestQuestionIndex(currentTime);
            this.prepareForQuestion(idx);
        }
    }

    onTracked = () => {
        this.destroyTracker(); // hopefully helping GC
        const videoPlayer = this.videoPlayer;
        if (!videoPlayer) {
            return;
        }
        videoPlayer.pauseVideo();
        this.setState({ isAsking: true });
        this.createHints();
        this.ask();
    }

    ask = async () => {
        const question = this.getCurrentQuestion();
        const questionText = question.speechText;
        const correctHintText = question.correctHints[0].attributes.speechText;
        const wrongHintText = question.wrongHints[0].attributes.speechText;

        const correctHint = this.correctHintRef.current;
        const wrongHint = this.wrongHintRef.current;
        const avatar = this.avatarRef.current;

        await sleep(500);
        avatar.startAnimation();
        await this.speechSynthesizer.speak(questionText);
        avatar.stopAnimation();
        await sleep(500);

        correctHint.startAnimation();
        avatar.startAnimation();
        await this.speechSynthesizer.speak(correctHintText);
        avatar.stopAnimation();
        correctHint.stopAnimation();
        await sleep(200);

        avatar.startAnimation();
        await this.speechSynthesizer.speak("or");
        avatar.stopAnimation();
        await sleep(300);

        wrongHint.startAnimation();
        avatar.startAnimation();
        await this.speechSynthesizer.speak(wrongHintText);
        avatar.stopAnimation();
        wrongHint.stopAnimation();
        await sleep(200);

        this.setState({ isAsking: false, isWaitingAnswer: true, isRecording: false });
    }

    //TODO do not mutate props, separate user's performance from contents
    feedback = async (isCorrect) => {
        const idx = this.state.currentQuestionIndex;
        let answers = Object.assign({}, this.state.answers);
        if (isCorrect) {
            answers[idx] = { "state": "CORRECT" };
            this.setState({ answers: answers });

            this.scoreBoardRef.current.startAnimation();
            await playSound(correct_sound);
            await sleep(500);
            this.scoreBoardRef.current.stopAnimation();
            this.passQuestion();
        } else {
            if (this.state.attempt < this.props.maxAnswerAttempt) {
                answers[idx] = { "state": "ATTEMPTED" };
                this.setState({ answers: answers });

                await playSound(wrong_sound);
                await sleep(500);
                this.tryAgain();
            }
            else {
                answers[idx] = { "state": "FAIL" };
                this.setState({ answers: answers });

                await playSound(fail_sound);
                await sleep(500);
                this.passQuestion();
            }
        }


    }

    passQuestion = () => {
        window.speechSynthesis.cancel();
        this.videoPlayer.playVideo();
        this.setState({ isAsking: false, isWaitingAnswer: false, isRecording: false });
        this.props.onUpdateAnswers(this.state.answers);
    }

    tryAgain = () => {
        window.speechSynthesis.cancel();

        this.setState((prevState, props) => ({
            attempt: prevState.attempt + 1
        }));
        this.setState({ isAsking: false, isWaitingAnswer: true, isRecording: false });
    }

    onResult = (result) => {
        const userAnswer = result.finalTranscript;
        const question = this.getCurrentQuestion();
        const expectedAnswer = question.intentions[0].entityValue;
        const contexts = this.contexts;
        sendText(userAnswer, contexts).then(response => {
            const parameters = response.parameters;
            const isCorrect = Object.values(parameters).includes(expectedAnswer);
            this.feedback(isCorrect);
        });
    }

    onSkipClick = (event) => {
        this.passQuestion();
    }

    createHint = (hintInfo, ref) => {
        const hint = (
            <HintCard
                imageURL={`${contentBucketURL}/flashcards/${hintInfo.attributes.viewUri}.png`}
                onClick={(event) => this.speechSynthesizer.aspeak(hintInfo.attributes.speechText)}
                ref={ref}
            />
        );

        return hint;
    }

    createHints = () => {
        const question = this.getCurrentQuestion();
        const ch = this.createHint(question.correctHints[0], this.correctHintRef);
        const wh = this.createHint(question.wrongHints[0], this.wrongHintRef);

        return [ch, wh];
    }


    // just for debugging, to be removed later
    onButtonClick = async (event) => {
        console.log(this.state);
    }

    componentWillUnmount() {
        this.destroyTracker();
        window.speechSynthesis.cancel();
        this.speechSynthesizer.deactivate();
    }

    render() {
        const video = this.props.video;

        const score = this.getScore().toString();
        const scoreBoard = <ScoreBoard ref={this.scoreBoardRef} score={score} />;

        let skipButton;
        let recognitionView;
        if (this.state.isWaitingAnswer) {
            skipButton = (
                <div className="SkipButton">
                    <Button onClick={event => this.onSkipClick(event)} bsStyle="default" bsSize="large">
                        <FontAwesomeIcon icon={faForward} size='1x' /> Skip
                    </Button>
                </div>
            );

            recognitionView = <RecognitionView record={this.state.isRecording} onResult={(result) => this.onResult(result)} />;
        }

        let avatar;
        let indicator;
        let correctHint;
        let wrongHint;
        if (this.state.isAsking || this.state.isWaitingAnswer) {
            avatar = <Avatar ref={this.avatarRef} />;
            indicator = this.getIndicator();
            [correctHint, wrongHint] = this.createHints();
        }

        return (
            <div className="LecturePanel">
                <Row className="justify-content-center">
                    <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
                        <Row>
                            <div className="VideoPanel">
                                <VideoDetail
                                    video={video}
                                    onPlayerReady={player => this.onPlayerReady(player)}
                                    onPlayerStateChange={event => this.onPlayerStateChange(event)}
                                />
                                {avatar}
                                {scoreBoard}
                                {skipButton}
                                {indicator}
                            </div>
                        </Row>
                        <Row className="AnswerPanel">
                            <Col sm={2}>
                                {correctHint}
                            </Col>
                            <Col sm={8}>
                                {recognitionView}
                            </Col>
                            <Col sm={2}>
                                {wrongHint}
                            </Col>
                        </Row>
                        <Row></Row>
                    </Col>
                    <Col md={2}>
                        <Row>
                            <Button onClick={event => this.onButtonClick(event)} bsStyle="info">
                                debug
                            </Button>
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }

}

LecturePanel.propTypes = {
    content: PropTypes.object.isRequired,
    video: PropTypes.object.isRequired,
    userPerformance: PropTypes.object,
    maxAnswerAttempt: PropTypes.number,
};

// Specifies the default values for props:
LecturePanel.defaultProps = {
    maxAnswerAttempt: 2
};

export default LecturePanel;