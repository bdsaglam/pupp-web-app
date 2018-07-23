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


            let style = {
                "background-color": color,
                "background-repeat": "no - repeat",
                "border": "none",
                "cursor": "pointer",
                "overflow": "hidden",
                "outline": "none",
                "transition-duration": "0.7s",
                "flex-wrap": "nowrap",
                "flex-direction": "row",
                "margin": "0px 2px 0px 2px",
                "color": "white",
                "border-radius": "15px",
                "font-size": "0.8em",
            };

            if (i === this.props.currentIndex) {
                style["border"] = "1px";
                style["flex"] = "8";
            } else {
                style["flex"] = "1";
            }


            return (
                <button onClick={() => this.handleClick(i)} style={style} key={this.keyOffset + i}>
                    {i + 1}
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