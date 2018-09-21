import React, { Component } from "react";
import PropTypes from 'prop-types';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faArrowRight from "@fortawesome/fontawesome-free-solid/faArrowRight";
import "./Indicator.css";

class Indicator extends Component {
    render() {
        const style = {
            position: "absolute",
            ...this.props.style,
        };
        return (
            <div className="Indicator animate"
                style={style}>
                <FontAwesomeIcon icon={faArrowRight} size="4x" style={{ color: "yellow" }} />
            </div>
        );
    }
}

Indicator.propTypes = {
    style: PropTypes.object.isRequired,
};

export default Indicator;