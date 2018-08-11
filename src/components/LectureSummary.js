import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faCheckCircle from "@fortawesome/fontawesome-free-solid/faCheckCircle";
import faExclamationTriangle from "@fortawesome/fontawesome-free-solid/faExclamationTriangle";
import faTimesCircle from "@fortawesome/fontawesome-free-solid/faTimesCircle";
import faCircle from "@fortawesome/fontawesome-free-solid/faCircle";

import { getRandomInt } from "../libs/Utils";
import { AnswerState} from "../libs/contentLib";

import "./LectureSummary.css";

class LectureSummary extends Component {
    constructor(props) {
        super(props);
        this.keyOffset = getRandomInt(3000, 3999);
    }

    render() {
        const answerArray = _.values(this.props.answers);

        let correctCount, failedCount, attemptedCount, initialCount;
        correctCount = answerArray.filter(answer => {
            return answer.state === AnswerState.CORRECT ? true : false;
        }).length;

        failedCount = answerArray.filter(answer => {
            return answer.state === AnswerState.FAILED ? true : false;
        }).length;

        attemptedCount = answerArray.filter(answer => {
            return answer.state === AnswerState.ATTEMPTED ? true : false;
        }).length;

        initialCount = this.props.content.questions.length - correctCount - failedCount - attemptedCount;

        return (
            <div className="LectureSummary">
                <div className="AnswerCount CORRECT">
                    <p>Correct</p>
                    <p>
                        {
                            Array(correctCount).fill().map((e, i) =>
                                <span key={this.keyOffset + i}><FontAwesomeIcon icon={faCheckCircle} color="#27ae60" size="2x" /></span>
                            )
                        }
                    </p>
                </div>
                <div className="AnswerCount ATTEMPTED">
                    <p>Attempted</p>
                    <p>
                        {
                            Array(attemptedCount).fill().map((e, i) =>
                                <span key={this.keyOffset + i}><FontAwesomeIcon icon={faExclamationTriangle} color="#f1c40f" size="2x" /></span>
                            )
                        }
                    </p>
                </div>
                <div className="AnswerCount FAILED">
                    <p>Failed</p>
                    <p>
                        {
                            Array(failedCount).fill().map((e, i) =>
                                <span key={this.keyOffset + i}><FontAwesomeIcon icon={faTimesCircle} color="#d35400" size="2x" /></span>
                            )
                        }
                    </p>
                </div>
                <div className="AnswerCount INITIAL">
                    <p>Unanswered</p>
                    <p>
                        {
                            Array(initialCount).fill().map((e, i) =>
                                <span key={this.keyOffset + i}><FontAwesomeIcon icon={faCircle} color="#bdc3c7" size="2x" /></span>
                            )
                        }
                    </p>
                </div>
            </div>
        );
    }
}

LectureSummary.propTypes = {
    content: PropTypes.object.isRequired,
    answers: PropTypes.object.isRequired,
};

export default LectureSummary;