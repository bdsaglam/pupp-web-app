import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faForward from "@fortawesome/fontawesome-free-solid/faForward";
import faRedo from "@fortawesome/fontawesome-free-solid/faRedo";
import faUndo from "@fortawesome/fontawesome-free-solid/faUndo";

import ReactPlayer from 'react-player';

import AnswerState from "../libs/AnswerState";
import getSpeaker from "../libs/Speaker";
import { sendText } from "../libs/dialogFlowV1";
import { sleep, playSound, shuffle, sliceByIndices } from "../libs/Utils";
import { positive_sounds, negative_sounds, positive_videos, negative_videos } from "../libs/feedbacks";

import VideoDetail from "./VideoDetail";
import RecognitionView from "./RecognitionView";
import Indicator from "./Indicator";
import HintCard from "./HintCard";
import ScoreBoard from "./ScoreBoard";
import Avatar from "./Avatar";
import QuestionNavigator from "./QuestionNavigator";

import wrong_sound from "../media/wrong_answer.mp3";

import "./LecturePanel.css";

const contentBucketURL = process.env.REACT_APP_AWS_S3_CONTENT_BUCKET_URL;

class LecturePanel extends Component {
    constructor(props) {
        super(props);
        this.videoPlayer = null;
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
            isFeedbacking: false,
            feedbackMediaURL: null,
            hasStarted: false,
            attempt: 0,
            hintOrder: null,
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

    createHintOrder = (question) => {
        let hintOrder;
        if (question.correctHints && question.wrongHints) {
            const numHints = question.correctHints.length + question.wrongHints.length;
            let hintOrder = [...Array(numHints).keys()];
            shuffle(hintOrder);
        }

        return hintOrder;
    }

    getCurrentQuestion = () => {
        const idx = this.state.currentQuestionIndex;
        const question = this.props.content.questions[idx];
        return question;
    }

    getScore = () => {
        const answers = this.state.answers;
        if (!answers) {
            return 0;
        }
        const states = _.map(answers, answer => answer.state);
        return states.filter(s => (s === AnswerState.CORRECT)).length;
    };

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

    prepareForQuestion = (idx) => {
        const question = this.props.content.questions[idx];
        let hintOrder;
        if (question) {
            hintOrder = this.createHintOrder(question);
        }
        this.setState({ currentQuestionIndex: idx, hintOrder: hintOrder, isAsking: false, isWaitingAnswer: false, isRecording: false, attempt: 0 });
    }

    // render helpers - start
    createIndicator = (question) => {
        if (!question.indicator) {
            return;
        }

        const left = question.indicator.center.x * 100;
        const top = question.indicator.center.y * 100;
        const rotate = question.indicator.angle;
        return (<Indicator left={left} top={top} rotate={rotate} />);
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

    createHints = (question) => {
        let ch, wh;
        if (question.correctHints && question.wrongHints) {
            ch = this.createHint(question.correctHints[0], this.correctHintRef);
            wh = this.createHint(question.wrongHints[0], this.wrongHintRef);
        }

        let hints;
        if (this.state.hintOrder) {
            hints = sliceByIndices([ch, wh], this.state.hintOrder);
        }
        else {
            hints = [ch, wh];
        }

        return hints;
    }
    // render helpers - end

    // player events - start
    onPlayerReady = (playerRef) => {
        this.playerRef = playerRef;
        this.videoPlayer = playerRef.current.getInternalPlayer();
    }

    onPlayerStart = () => {
        const startTime = this.props.content.media.startTime || 1;
        this.videoPlayer.seekTo(startTime);
        this.videoPlayer.playVideo();
    }

    onPlayerPlay = () => {
        window.speechSynthesis.cancel();
        const currentTime = this.videoPlayer.getCurrentTime();
        const idx = this.findClosestQuestionIndex(currentTime);
        this.prepareForQuestion(idx);
    }

    onPlayerProgress = (event) => {
        if (this.state.isAsking || this.state.isWaitingAnswer || this.state.isRecording || this.state.isFeedbacking) return;

        const currentTime = event.playedSeconds;
        if (this.isQuestionTime(currentTime)) {
            this.setState({ isAsking: true });
            this.videoPlayer.pauseVideo();
            this.ask();
        }
        else if (this.isContentEndTime(currentTime)) {
            this.onFinish();
        }

    }

    onPlayerEnded = () => {
        this.onFinish();
    }

    isQuestionTime = (currentTime) => {
        const question = this.props.content.questions[this.state.currentQuestionIndex];
        if (!question) {
            return false;
        };

        const targetTime = question.stopTime;
        if ((targetTime - 0.5) < currentTime && currentTime < (targetTime + 0.5)) {
            return true;
        }

        return false;
    }

    isContentEndTime = (currentTime) => {
        const endTime = this.props.content.media.endTime;
        if (!endTime) return false;
        if (currentTime > endTime) {
            return true;
        }
        return false;
    }

    onFinish = () => {
        this.clear();
        if (this.props.onFinish) this.props.onFinish(this.state.answers);
    }
    // player events - end

    ask = async () => {
        const question = this.getCurrentQuestion();
        const questionText = question.speechText;

        const avatar = this.avatarRef.current;

        await sleep(500);
        avatar.startAnimation();
        await this.speechSynthesizer.speak(questionText);
        avatar.stopAnimation();
        await sleep(500);

        if (question.correctHints && question.wrongHints) {
            const correctHintText = question.correctHints[0].attributes.speechText;
            const wrongHintText = question.wrongHints[0].attributes.speechText;

            const correctHint = this.correctHintRef.current;
            const wrongHint = this.wrongHintRef.current;

            let hints = [
                { element: correctHint, speechText: correctHintText },
                { element: wrongHint, speechText: wrongHintText }
            ];


            let hint1, hint2;
            if (this.state.hintOrder) {
                [hint1, hint2] = sliceByIndices(hints, this.state.hintOrder);
            } else {
                [hint1, hint2] = hints;
            }

            hint1.element.startAnimation();
            avatar.startAnimation();
            await this.speechSynthesizer.speak(hint1.speechText);
            avatar.stopAnimation();
            hint1.element.stopAnimation();
            await sleep(200);

            avatar.startAnimation();
            await this.speechSynthesizer.speak("or");
            avatar.stopAnimation();
            await sleep(300);

            hint2.element.startAnimation();
            avatar.startAnimation();
            await this.speechSynthesizer.speak(hint2.speechText);
            avatar.stopAnimation();
            hint2.element.stopAnimation();
            await sleep(200);
        }

        this.setState({ isAsking: false, isWaitingAnswer: true, isRecording: false });
    }

    feedback = async (isCorrect) => {
        const idx = this.state.currentQuestionIndex;
        let answers = Object.assign({}, this.state.answers);
        if (isCorrect) {
            answers[idx] = { "state": AnswerState.CORRECT };

            this.scoreBoardRef.current.startAnimation();
            await playSound(_.sample(positive_sounds));
            await sleep(500);
            this.scoreBoardRef.current.stopAnimation();
            this.setState({ answers: answers, isFeedbacking: true, feedbackMediaURL: _.sample(positive_videos) });

        } else {
            if (this.state.attempt < this.props.maxAnswerAttempt) {
                answers[idx] = { "state": AnswerState.ATTEMPTED };
                this.setState({ answers: answers });

                await playSound(wrong_sound);
                await sleep(500);
                this.tryAgain();
            }
            else {
                answers[idx] = { "state": AnswerState.FAILED };
                this.setState({ answers: answers });

                await playSound(_.sample(negative_sounds));
                await sleep(500);
                this.setState({ answers: answers });
                this.passQuestion();
            }
        }

    }

    passQuestion = () => {
        window.speechSynthesis.cancel();
        const currentQuestionIndex = this.state.currentQuestionIndex;
        this.setState({
            currentQuestionIndex: currentQuestionIndex + 1,
            isAsking: false,
            isWaitingAnswer: false,
            isRecording: false,
            isFeedbacking: false,
            feedbackMediaURL: null
        });
        this.videoPlayer.playVideo();
        this.props.onUpdateAnswers(this.state.answers);
    }

    jumpToQuestion = (idx) => {
        const question = this.props.content.questions[idx];
        const startTime = question.startTime;
        this.videoPlayer.seekTo(startTime);
        this.videoPlayer.playVideo();
    }

    handleJumpVideo = async (direction) => {
        const dt = 5;
        const currentTime = await this.videoPlayer.getCurrentTime();
        this.videoPlayer.seekTo(currentTime + dt * direction);
        this.videoPlayer.playVideo();

    }

    tryAgain = () => {
        window.speechSynthesis.cancel();

        this.setState((prevState, props) => ({
            attempt: prevState.attempt + 1
        }));
        this.setState({ isAsking: false, isWaitingAnswer: true, isRecording: false });
    }

    onRecognitionResult = (result) => {
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

    // just for debugging, to be removed later
    onButtonClick = async (event) => {
        console.log(this.state);
    }

    clear = () => {
        window.speechSynthesis.cancel();
        this.speechSynthesizer.deactivate();
        if (this.videoPlayer) this.videoPlayer.pauseVideo();
    }

    componentWillUnmount() {
        this.clear();
    }

    render() {
        const video = this.props.video;
        const question = this.getCurrentQuestion();

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

            recognitionView = <RecognitionView record={this.state.isRecording} onResult={(result) => this.onRecognitionResult(result)} />;
        }

        let avatar;
        let indicator;
        let correctHint;
        let wrongHint;
        if (question && (this.state.isAsking || this.state.isWaitingAnswer)) {
            avatar = <Avatar ref={this.avatarRef} />;
            indicator = this.createIndicator(question);
            [correctHint, wrongHint] = this.createHints(question);
        }

        let feedbackMedia;
        if (this.state.isFeedbacking) {
            feedbackMedia = (
                <div className='FeedbackMedia'>
                    <ReactPlayer
                        volume={1}
                        width='100%'
                        height='100%'
                        url={this.state.feedbackMediaURL}
                        playing={true}
                        onEnded={() => setTimeout(this.passQuestion, 200)}
                    />
                </div>
            );
        }

        return (
            <div className="LecturePanel">
                <Row>
                    <Col xs={2}>
                        <Row>
                            <button className="VideoJumpButton" onClick={e => this.handleJumpVideo(-1)} >
                                <FontAwesomeIcon icon={faUndo} color="#496179" size="2x" />
                            </button>
                        </Row>
                    </Col>
                    <Col xs={8}>
                        <Row>
                            <div className="VideoPanel">
                                <VideoDetail
                                    provider="youtube"
                                    video={video}
                                    onPlayerReady={player => this.onPlayerReady(player)}
                                    onPlayerStart={this.onPlayerStart}
                                    onPlayerPlay={this.onPlayerPlay}
                                    onPlayerProgress={this.onPlayerProgress}
                                    onPlayerEnded={this.onPlayerEnded}
                                    options={{ progressInterval: 500 }}
                                />
                                {avatar}
                                {scoreBoard}
                                {skipButton}
                                {indicator}
                                {feedbackMedia}
                            </div>
                        </Row>
                        <Row>
                            <QuestionNavigator
                                questions={this.props.content.questions}
                                answers={this.state.answers}
                                currentIndex={this.state.currentQuestionIndex}
                                onSelect={(idx) => this.jumpToQuestion(idx)}
                            />
                        </Row>
                        <Row className="AnswerPanel">
                            <Col xs={2}>
                                {correctHint}
                            </Col>
                            <Col xs={8}>
                                {recognitionView}
                            </Col>
                            <Col xs={2}>
                                {wrongHint}
                            </Col>
                        </Row>
                        <Row></Row>
                    </Col>
                    <Col xs={2}>
                        <Row>
                            <button className="VideoJumpButton" onClick={e => this.handleJumpVideo(1)} >
                                <FontAwesomeIcon icon={faRedo} color="#496179" size="2x" />
                            </button>
                        </Row>
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
    answers: PropTypes.object.isRequired,
    maxAnswerAttempt: PropTypes.number,
    onUpdateAnswers: PropTypes.func,
    onFinish: PropTypes.func,
};

// Specifies the default values for props:
LecturePanel.defaultProps = {
    maxAnswerAttempt: 2
};

export default LecturePanel;