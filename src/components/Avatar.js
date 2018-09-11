import React, { Component } from "react";
import PropTypes from 'prop-types';
import withAnimation from "../libs/withAnimation";
import avatarStatic from "../img/avatar-static.png";
import avatarGIF from "../img/avatar.gif";
import "./Avatar.css";

class Avatar extends Component {
    render() {
        const className = "Avatar " + this.props.className;
        return (
            <div className={className} onClick={this.props.onClick}>
                <img className="static" src={avatarStatic} alt='' />
                <img className="active" src={avatarGIF} alt='' />
            </div>
        );
    }
}

Avatar.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
};

Avatar.defaultProps = {
    className: "",
};

export default withAnimation(Avatar);