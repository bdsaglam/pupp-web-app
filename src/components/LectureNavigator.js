import React, { Component } from "react";
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faCircle from "@fortawesome/fontawesome-free-solid/faCircle";
import faBullseye from "@fortawesome/fontawesome-free-solid/faBullseye";
import AnswerState from "../libs/AnswerState";
import { getRandomInt } from "../libs/Utils";
import "./LectureNavigator.css";

class LectureNavigator extends Component {
    constructor(props) {
        super(props);
        this.keyOffset = getRandomInt(2000, 2999);
    }


    handleClick = (idx) => {
        this.props.onSelect(idx);
    }

    renderIcons() {
        return this.props.questions.map((question, i) => {
            const answer = this.props.answers[i];
            const answerState = answer ? answer.state : "INITIAL";

            let color;
            switch (answerState) {
                case AnswerState.CORRECT:
                    color = "#27ae60";
                    break;
                case AnswerState.ATTEMPTED:
                    color = "#f1c40f";
                    break;
                case AnswerState.FAILED:
                    color = "#d35400";
                    break;
                default:
                    color = "#bdc3c7";
            }


            let icon;
            if (i === this.props.currentIndex) {
                icon = faBullseye;
            }
            else {
                icon = faCircle;
            }

            return (
                <button onClick={() => this.handleClick(i)} className="NavigationButton" key={this.keyOffset + i}>
                    <FontAwesomeIcon icon={icon} color={color} size="2x" />
                </button>
            );
        }
        );
    }

    render() {
        return (
            <div className="LectureNavigator">
                {this.renderIcons()}
            </div>
        );
    }
}

LectureNavigator.propTypes = {
    level: PropTypes.number,
};

export default LectureNavigator;