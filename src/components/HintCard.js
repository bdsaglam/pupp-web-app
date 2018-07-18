import React, { Component } from "react";
import PropTypes from 'prop-types';
import withAnimation from "../libs/withAnimation";
import "./HintCard.css";

class HintCard extends Component {
    render() {
        const className = "HintCard " + this.props.className;
        return (
            <div className={className}>
                <img
                    className="media-object"
                    src={this.props.imageURL}
                    onClick={this.props.onClick}
                    alt={""} />
            </div>
        );
    }
}

HintCard.propTypes = {
    imageURL: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

HintCard.defaultProps = {
    className: "",
};

export default withAnimation(HintCard);