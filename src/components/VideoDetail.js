import React, { Component } from "react";
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';

class VideoDetail extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
  }

  onReady = (event) => {
    const player = this.videoRef.current.internalPlayer;
    this.props.onPlayerReady(player);
  }

  onStateChange = (event) => {
    this.props.onPlayerStateChange(event);
  }

  render() {
    const video = this.props.video;
    const options = this.props.options;

    return (
      <div className="VideoDetail">
        <div className="embed-responsive embed-responsive-16by9">
          <YouTube
            ref={this.videoRef}
            videoId={video.id}
            opts={options}
            onReady={event => this.onReady(event)}
            onStateChange={event => this.onStateChange(event)}
          />
        </div>
      </div>
    );
  }

}

VideoDetail.propTypes = {
  video: PropTypes.object.isRequired,
  onPlayerReady: PropTypes.func.isRequired,
  onPlayerStateChange: PropTypes.func.isRequired,
  options: PropTypes.object,
};

VideoDetail.defaultProps = {
  options: {
    // https://developers.google.com/youtube/player_parameters
    playerVars: {
      autoplay: 1,
      start: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
    }
  },
};

export default VideoDetail;