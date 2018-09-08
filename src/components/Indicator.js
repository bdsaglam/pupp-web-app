import React, { Component } from "react";
import PropTypes from 'prop-types';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faArrowRight from "@fortawesome/fontawesome-free-solid/faArrowRight";
import "./Indicator.css";

class Indicator extends Component {
    render() {
        const left = this.props.left + "%";
        const top = this.props.top + "%";
        const rotate = this.props.rotate || "0";
        const transform = `rotate(${rotate}deg)`;
        const style = {
            position: "absolute",
            left: left, 
            top: top, 
            transform: transform
        };
        return (
            <div className="Indicator animate"
                style={style}>
                <FontAwesomeIcon icon={faArrowRight} size="3x" style={{ color: "yellow" }} />
            </div>
        );
    }
}

Indicator.propTypes = {
    left: PropTypes.number,
    top: PropTypes.number,
    rotate: PropTypes.number,
};

export default Indicator;