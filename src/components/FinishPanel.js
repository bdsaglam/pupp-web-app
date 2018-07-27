import React, { Component } from "react";
import PropTypes from 'prop-types';
import "./FinishPanel.css";

class FinishPanel extends Component {
    render() {
        const content = this.props.content;
        const questionCount = content.questions.length;
        const correctCount = 4;
        const wrongCount = 1;
        const attemptedCount = 3;

        return (
            <div className="FinishPanel">
                <div>
                    <p>questions: {questionCount}</p>
                    <p>correct answers: {correctCount}</p>
                    <p>wrong answers: {wrongCount}</p>
                    <p>attemps: {attemptedCount}</p>
                </div>
            </div>
        );
    }
}

FinishPanel.propTypes = {

};

FinishPanel.defaultProps = {
};

export default FinishPanel;