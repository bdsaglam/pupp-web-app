import React, { Component } from "react";
import PropTypes from 'prop-types';
import withAnimation from "../libs/withAnimation";
import "./ScorePoint.css";

class ScorePoint extends Component {
    render() {
        const point = this.props.point;
        const className = "ScorePoint " + this.props.className;
        return (
            <div className={className}>
                <span>{(point > 0 ? "+" : "") + point}</span>
            </div>
        );
    }
}

ScorePoint.propTypes = {
    point: PropTypes.number.isRequired,
    className: PropTypes.string,
};

ScorePoint.defaultProps = {
    className: "",
};

export default withAnimation(ScorePoint);