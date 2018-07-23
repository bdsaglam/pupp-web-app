import React, { Component } from "react";
import PropTypes from 'prop-types';
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

    renderButtons() {
        return this.props.questions.map((question, i) => {
            const answer = this.props.answers[i];
            const answerState = answer ? answer.state : "INITIAL";

            let className;
            if (i === this.props.currentIndex) {
                className = `NavigationButton Active ${answerState}`;
            } else {
                className = `NavigationButton Inactive ${answerState}`;
            }

            return (
                <button onClick={() => this.handleClick(i)} className={className} key={this.keyOffset + i}>
                    {i + 1}
                </button>
            );
        }
        );
    }

    render() {
        return (
            <div className="LectureNavigator">
                {this.renderButtons()}
            </div>
        );
    }
}

LectureNavigator.propTypes = {
    questions: PropTypes.arrayOf(PropTypes.object).isRequired,
    answers: PropTypes.arrayOf(PropTypes.object),
    currentIndex: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default LectureNavigator;