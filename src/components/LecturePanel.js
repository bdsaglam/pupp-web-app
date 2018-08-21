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

import getSpeaker from "../libs/Speaker";
import { sendText } from "../libs/dialogFlowV1";
import { sleep, playSound, shuffle, sliceByIndices, isSubset } from "../libs/Utils";
import { AnswerState, calculateScore, CORRECT_SCORE_POINT, FAILED_SCORE_POINT } from "../libs/contentLib";

import VideoDetail from "./VideoDetail";
import RecognitionView from "./RecognitionView";
import Indicator from "./Indicator";
import HintCard from "./HintCard";
import ScoreBoard from "./ScoreBoard";
import ScorePoint from "./ScorePoint";
import Avatar from "./Avatar";
import QuestionNavigator from "./QuestionNavigator";

import CELEBRATION_VIDEO from "../media/celebration-video.mp4";
import CORRECT_ANSWER_SOUND from "../media/correct-answer-sound.mp3";
import WRONG_ANSWER_SOUND from "../media/wrong-answer-sound.mp3";
import FAIL_SOUND from "../media/fail-sound.mp3";

import "./LecturePanel.css";

const contentBucketURL = process.env.REACT_APP_AWS_S3_CONTENT_BUCKET_URL;

class LecturePanel extends Component {
    constructor(props) {
        super(props);
        this.videoPlayer = null;
        this.speechSynthesizer = getSpeaker();
        this.contexts = this.createContexts(this.props.content);
        this.celebrationMediaURL = CELEBRATION_VIDEO;

        this.correctHintRef = React.createRef();
        this.wrongHintRef = React.createRef();
        this.scoreBoardRef = React.createRef();
        this.successScorePointRef = React.createRef();
        this.failScorePointRef = React.createRef();
        this.avatarRef = React.createRef();

        const isSucceeded = this.checkSuccess(this.props.answers);

        this.state = {
            currentQuestionIndex: 0,
            isAsking: false,
            isWaitingAnswer: false,
            isRecording: false,
            isCelebrating: false,
            isSucceeded: isSucceeded,
            hasStarted: false,
            attempt: 0,
            hintOrder: null,
            answers: Object.assign({}, this.props.answers),
        };
    }

    createContexts = (content) => {
        return [];
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
        if (question.hint && question.hint.type === "multi-choice") {
            const numHints = question.hint.choices.length;
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
        const hintCard = (
            <HintCard
                imageURL={`${contentBucketURL}/flashcards/${hintInfo.attributes.viewUri}.png`}
                onClick={(event) => this.speechSynthesizer.aspeak(hintInfo.attributes.speechText)}
                ref={ref}
            />
        );

        return hintCard;
    }

    createHints = (question) => {
        let ch, wh;
        if (question.hint && question.hint.type === "multi-choice") {
            ch = this.createHint(question.hint.choices[0], this.correctHintRef);
            wh = this.createHint(question.hint.choices[1], this.wrongHintRef);
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
        this.props.onUpdateAnswers(this.state.answers);
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
        if (this.state.isAsking || this.state.isWaitingAnswer || this.state.isRecording || this.state.isCelebrating) return;

        const currentTime = event.playedSeconds;
        if (this.isQuestionTime(currentTime)) {

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
        this.setState({ isAsking: true });

        const question = this.getCurrentQuestion();
        const questionText = question.speechText;

        const avatar = this.avatarRef.current;

        await sleep(500);
        avatar.startAnimation();
        await this.speechSynthesizer.speak(questionText);
        avatar.stopAnimation();
        await sleep(500);

        if (question.hint && question.hint.type === 'multi-choice') {
            const correctHint = _.find(question.hint.choices, ['isCorrect', true]);
            const wrongHint = _.find(question.hint.choices, ['isCorrect', false]);

            const ch = this.correctHintRef.current;
            const wh = this.wrongHintRef.current;

            let hints = [
                { element: ch, speechText: correctHint.attributes.speechText },
                { element: wh, speechText: wrongHint.attributes.speechText }
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

    checkSuccess = (answers) => {
        const questionCount = this.props.content.questions.length;
        const answerArray = Object.values(answers);
        const corrects = answerArray.filter(answer => answer.state === AnswerState.CORRECT);
        return corrects.length === questionCount;
    }

    feedback = async (isCorrect) => {
        const idx = this.state.currentQuestionIndex;
        let answers = Object.assign({}, this.state.answers);
        if (isCorrect) {
            answers[idx] = { "state": AnswerState.CORRECT };

            this.successScorePointRef.current.startAnimation();
            playSound(CORRECT_ANSWER_SOUND);
            await sleep(1500);
            this.successScorePointRef.current.stopAnimation();

            this.setState({ answers: answers });
            const success = this.checkSuccess(answers);
            if (success && !this.state.isSucceeded) {
                this.celebrate();
            }
            else {
                this.passQuestion();
            }

        } else {
            if (this.state.attempt < this.props.maxAnswerAttempt) {
                answers[idx] = { "state": AnswerState.ATTEMPTED };
                this.setState({ answers: answers });

                await playSound(WRONG_ANSWER_SOUND);
                await sleep(500);
                this.tryAgain();
            }
            else {
                this.failScorePointRef.current.startAnimation();
                playSound(FAIL_SOUND);
                await sleep(1500);
                this.failScorePointRef.current.stopAnimation();

                answers[idx] = { "state": AnswerState.FAILED };
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

    evaluateAnswer = (expectedAnswers, receivedAnswer) => {
        for (const expectedAnswer of expectedAnswers) {
            if (isSubset(expectedAnswer, receivedAnswer)) return true;
        }
        return false;
    }

    onRecognitionResult = async (recognitionResult) => {
        const userAnswer = recognitionResult.finalTranscript;
        const question = this.getCurrentQuestion();
        const intentName = question.intentName;
        const expectedAnswers = question.expectedAnswers;
        const contexts = this.contexts;
        try {
            const result = await sendText(userAnswer, intentName, contexts);
            const receivedAnswer = result.parameters;
            const isCorrect = this.evaluateAnswer(expectedAnswers, receivedAnswer);
            // console.log("expectedAnswers");
            // console.log(expectedAnswers);
            // console.log("receivedAnswer");
            // console.log(receivedAnswer);
            // console.log("isCorrect", isCorrect);
            this.feedback(isCorrect);
        } catch (error) {
            console.log("dialog flow api request error");
        }
    }

    onSkipClick = (event) => {
        this.passQuestion();
    }

    celebrate = () => {
        this.setState({ isCelebrating: true, isSucceeded: true });
    }

    onCelebrationEnded = () => {
        this.setState({ isCelebrating: false });
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

        const score = calculateScore(this.state.answers);
        const scoreBoard = <ScoreBoard ref={this.scoreBoardRef} score={score} />;
        const successScorePoint = <ScorePoint ref={this.successScorePointRef} point={CORRECT_SCORE_POINT} className="Success" />;
        const failScorePoint = <ScorePoint ref={this.failScorePointRef} point={FAILED_SCORE_POINT} className="Fail" />;

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

        let celebrationMedia;
        if (this.state.isCelebrating) {
            celebrationMedia = (
                <div className='CelebrationMedia'>
                    <ReactPlayer
                        volume={1}
                        width='100%'
                        height='100%'
                        url={this.celebrationMediaURL}
                        playing={true}
                        onEnded={() => setTimeout(this.onCelebrationEnded, 200)}
                    />
                </div>
            );
        }

        return (
            <div className="LecturePanel">
                <Row>
                    <Col xs={10} xsOffset={1}>
                        <Row className="VideoRow">
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
                                {successScorePoint}
                                {failScorePoint}
                                {skipButton}
                                {indicator}
                                {celebrationMedia}
                            </div>
                        </Row>
                        <Row className="QuestionRow">
                            <QuestionNavigator
                                questions={this.props.content.questions}
                                answers={this.state.answers}
                                currentIndex={this.state.currentQuestionIndex}
                                onSelect={(idx) => this.jumpToQuestion(idx)}
                            />
                        </Row>
                        <Row className="AnswerRow">
                            <Col xs={3}>
                                {correctHint}
                            </Col>
                            <Col xs={6}>
                                {recognitionView}
                            </Col>
                            <Col xs={3}>
                                {wrongHint}
                            </Col>
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