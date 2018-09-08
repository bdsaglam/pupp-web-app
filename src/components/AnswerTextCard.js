import React, { Component } from "react";
import PropTypes from 'prop-types';
import withAnimation from "../libs/withAnimation";
import "./AnswerTextCard.css";

class AnswerTextCard extends Component {
    render() {
        const className = "AnswerTextCard " + this.props.className;
        return (
            <div className={className} onClick={this.props.onClick}>
                {this.props.text}
            </div>
        );
    }
}

AnswerTextCard.propTypes = {
    imageURL: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

AnswerTextCard.defaultProps = {
    className: "",
};

export default withAnimation(AnswerTextCard);