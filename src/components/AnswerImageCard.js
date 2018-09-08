import React, { Component } from "react";
import PropTypes from 'prop-types';
import withAnimation from "../libs/withAnimation";
import "./AnswerImageCard.css";

class AnswerImageCard extends Component {
    render() {
        const className = "AnswerImageCard " + this.props.className;
        return (
            <div className={className} onClick={this.props.onClick}>
                <img
                    src={this.props.imageSrc}
                    alt="" />
            </div>
        );
    }
}

AnswerImageCard.propTypes = {
    imageURL: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

AnswerImageCard.defaultProps = {
    className: "",
};

export default withAnimation(AnswerImageCard);