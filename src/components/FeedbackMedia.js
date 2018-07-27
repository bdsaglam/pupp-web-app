import React, { Component } from 'react';
import ReactPlayer from 'react-player';

class FeedbackMedia extends Component {
    render() {
        return (
            <ReactPlayer
                volume={1}
                url={this.props.src}
                playing={this.props.playing}
                onEnded={this.props.onEnded}
            />
        );
    }
}


export default FeedbackMedia;