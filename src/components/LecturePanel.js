import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faForward from "@fortawesome/fontawesome-free-solid/faForward";

import ReactPlayer from 'react-player';

import getSpeaker from "../libs/Speaker";
import { sendText } from "../libs/dialogFlowV1";
import { sleep, playSound, shuffle, sliceByIndices, isSubset } from "../libs/Utils";
import { AnswerState, calculateScore, CORRECT_SCORE_POINT, FAILED_SCORE_POINT } from "../libs/contentLib";

import VideoDetail from "./VideoDetail";
import RecognitionView from "./RecognitionView";
import Indicator from "./Indicator";
import AnswerImageCard from "./AnswerImageCard";
import AnswerTextCard from "./AnswerTextCard";
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
        this.celebrationMediaURL = CELEBRATION_VIDEO;

        this.avatarRef = React.createRef();
        this.scoreBoardRef = React.createRef();

        this.successScorePointRef = React.createRef();
        this.failScorePointRef = React.createRef();

        this.correctChoiceRef = React.createRef();
        this.wrongChoiceRef = React.createRef();

        const isSucceeded = this.checkSuccess(this.props.answers);

        this.state = {
            answers: Object.assign({}, this.props.answers),
            currentQuestionIndex: 0,
            isAsking: false,
            isWaitingAnswer: false,
            isRecording: false,
            isCelebrating: false,
            isSucceeded: isSucceeded,
            hasStarted: false,
            attempt: 0,
            choiceOrder: null,
        };
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
        let choiceOrder;
        if (question && question.choices) {
            choiceOrder = [...Array(question.choices.length).keys()];
            shuffle(choiceOrder);
        }

        this.setState({ currentQuestionIndex: idx, isAsking: false, isWaitingAnswer: false, isRecording: false, attempt: 0, choiceOrder: choiceOrder });
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

    createChoiceCard = ({ choice, onClickCallback, ref }) => {
        switch (choice.type) {
            case "image":
                return (
                    <AnswerImageCard
                        ref={ref}
                        imageSrc={`${contentBucketURL}/flashcards/${choice.attributes.viewUri}.png`}
                        onClick={onClickCallback}
                    />
                );
            case "text":
                return (
                    <AnswerTextCard
                        ref={ref}
                        text={choice.attributes.text}
                        onClick={onClickCallback}
                    />
                );
            default:
                return;
        }
    }

    createMultiChoiceAnswerPanel = (question) => {
        const correctChoice = _.find(question.choices, ['isCorrect', true]);
        const correctCard = this.createChoiceCard(
            {
                choice: correctChoice,
                onClickCallback: _.debounce((event) => this.feedback(true), 500),
                ref: this.correctChoiceRef
            }
        );

        const wrongChoice = _.find(question.choices, ['isCorrect', false]);
        const wrongCard = this.createChoiceCard(
            {
                choice: wrongChoice,
                onClickCallback: _.debounce((event) => this.feedback(false), 500),
                ref: this.wrongChoiceRef
            }
        );

        const cards = sliceByIndices([correctCard, wrongCard], this.state.choiceOrder);

        return (
            <div className="AnswerPanel">
                {cards[0]}
                {cards[1]}
            </div>
        );
    }

    createSpeechAnswerPanel = (question) => {
        const correctChoice = _.find(question.choices, ['isCorrect', true]);
        const correctCard = this.createChoiceCard(
            {
                choice: correctChoice,
                onClickCallback: _.debounce((event) => this.speechSynthesizer.aspeak(correctChoice.attributes.speechText), 500),
                ref: this.correctChoiceRef
            }
        );

        const wrongChoice = _.find(question.choices, ['isCorrect', false]);
        const wrongCard = this.createChoiceCard(
            {
                choice: wrongChoice,
                onClickCallback: _.debounce((event) => this.speechSynthesizer.aspeak(wrongChoice.attributes.speechText), 500),
                ref: this.wrongChoiceRef
            }
        );

        const cards = sliceByIndices([correctCard, wrongCard], this.state.choiceOrder);

        return (
            <Row className="AnswerRow" >
                <Col xs={3}>
                    {cards[0]}
                </Col>
                <Col xs={6}>
                    <RecognitionView record={this.state.isRecording} onResult={(result) => this.onRecognitionResult(result)} />
                </Col>
                <Col xs={3}>
                    {cards[1]}
                </Col>
            </Row >
        );
    }

    createAnswerPanel = (question) => {
        switch (question.type) {
            case "multi-choice-click":
                return this.createMultiChoiceAnswerPanel(question);
            case "multi-choice-speak":
                return this.createSpeechAnswerPanel(question);
            default:
                return;
        }
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
        const avatar = this.avatarRef.current;

        await sleep(500);
        avatar.startAnimation();
        await this.speechSynthesizer.speak(question.speechText);
        avatar.stopAnimation();
        await sleep(500);

        if (question.type === 'multi-choice-click' || question.type === 'multi-choice-speak') {
            const correctChoice = _.find(question.choices, ['isCorrect', true]);
            const wrongChoice = _.find(question.choices, ['isCorrect', false]);

            const correctCard = this.correctChoiceRef.current;
            const wrongCard = this.wrongChoiceRef.current;

            let choiceCards = [
                { element: correctCard, obj: correctChoice },
                { element: wrongCard, obj: wrongChoice }
            ];

            const [firstCard, secondCard] = sliceByIndices(choiceCards, this.state.choiceOrder);

            firstCard.element.startAnimation();
            avatar.startAnimation();
            await this.speechSynthesizer.speak(firstCard.obj.attributes.speechText);
            avatar.stopAnimation();
            firstCard.element.stopAnimation();
            await sleep(200);

            avatar.startAnimation();
            await this.speechSynthesizer.speak("or");
            avatar.stopAnimation();
            await sleep(300);

            secondCard.element.startAnimation();
            avatar.startAnimation();
            await this.speechSynthesizer.speak(secondCard.obj.attributes.speechText);
            avatar.stopAnimation();
            secondCard.element.stopAnimation();
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
        const question = this.getCurrentQuestion();

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
            const attemptLimit = question.attemptLimit || 0;
            if (this.state.attempt < attemptLimit) {
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

    evaluateSpeechAnswer = (expectedAnswers, receivedAnswer) => {
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
        try {
            const result = await sendText(userAnswer, intentName);
            const receivedAnswer = result.parameters;
            const isCorrect = this.evaluateSpeechAnswer(expectedAnswers, receivedAnswer);
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

    clear = () => {
        window.speechSynthesis.cancel();
        this.speechSynthesizer.deactivate();
        if (this.videoPlayer) this.videoPlayer.pauseVideo();
    }

    handleAvatar = () => {
        if (this.state.isWaitingAnswer) {
            const question = this.getCurrentQuestion();
            this.speechSynthesizer.speak(question.speechText);
        }
    }

    componentWillUnmount() {
        this.clear();
    }

    render() {
        const content = this.props.content;
        const question = this.getCurrentQuestion();

        const score = calculateScore(this.state.answers);
        const scoreBoard = <ScoreBoard ref={this.scoreBoardRef} score={score} />;
        const successScorePoint = <ScorePoint ref={this.successScorePointRef} point={CORRECT_SCORE_POINT} className="Success" />;
        const failScorePoint = <ScorePoint ref={this.failScorePointRef} point={FAILED_SCORE_POINT} className="Fail" />;

        let avatar;
        let indicator;
        let answerPanel;
        if (question && (this.state.isAsking || this.state.isWaitingAnswer)) {
            avatar = <Avatar ref={this.avatarRef} onClick={_.debounce(this.handleAvatar, 500)} />;
            indicator = this.createIndicator(question);
            answerPanel = this.createAnswerPanel(question);
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

        let skipButton;
        if (this.state.isWaitingAnswer) {
            skipButton = (
                <div className="SkipButton">
                    <Button onClick={event => this.onSkipClick(event)} bsStyle="default" bsSize="large">
                        <FontAwesomeIcon icon={faForward} size='1x' /> Skip
                    </Button>
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
                                    media={content.media}
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
                        {answerPanel}
                    </Col>
                </Row>
            </div>
        );
    }

}

LecturePanel.propTypes = {
    content: PropTypes.object.isRequired,
    answers: PropTypes.object.isRequired,
    onUpdateAnswers: PropTypes.func,
    onFinish: PropTypes.func,
};

// Specifies the default values for props:
LecturePanel.defaultProps = {
};

export default LecturePanel;