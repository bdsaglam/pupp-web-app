import React, { Component } from "react";
import PropTypes from 'prop-types';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faStar from "@fortawesome/fontawesome-free-solid/faStar";
import withAnimation from "../libs/withAnimation";
import "./ScoreBoard.css";

class ScoreBoard extends Component {
    render() {
        const className = "ScoreBoard " + this.props.className;
        return (
            <div className={className}>
                <FontAwesomeIcon icon={faStar} size='3x' style={{ color: 'orange' }} />
                <div className="score-text">
                    {this.props.score}
                </div>
            </div>
        );
    }
}

ScoreBoard.propTypes = {
    score: PropTypes.string.isRequired,
    className: PropTypes.string,
};

ScoreBoard.defaultProps = {
    className: "",
};

export default withAnimation(ScoreBoard);