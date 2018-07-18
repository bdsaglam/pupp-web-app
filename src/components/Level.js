import React, { Component } from "react";
import PropTypes from 'prop-types';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faRocket from "@fortawesome/fontawesome-free-solid/faRocket";
import { getRandomInt } from "../libs/Utils";
import "./Level.css";

class Level extends Component {
    constructor(props) {
        super(props);
        this.keyOffset = getRandomInt(1000, 1999);
    }

    renderIcons() {
        return Array(this.props.level).fill().map((e, i) =>
            <span key={this.keyOffset + i}><FontAwesomeIcon icon={faRocket} color="#E64A19" size="sm" /></span>
        );
    }

    render() {
        return (
            <div className="Level">
                {this.renderIcons()}
            </div>
        );
    }
}

Level.propTypes = {
    level: PropTypes.number,
};

export default Level;