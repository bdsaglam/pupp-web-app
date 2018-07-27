import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import YouTube from 'react-youtube';

class VideoDetail extends Component {
  constructor(props) {
    super(props);
    this.playerRef = React.createRef();
  }

  onPlayerReady = (event) => {
    if (this.props.onPlayerReady) this.props.onPlayerReady(this.playerRef);
  }

  onPlayerStart = () => {
    if (this.props.onPlayerStart) this.props.onPlayerStart();
  }

  onPlayerProgress = (event) => {
    if (this.props.onPlayerProgress) this.props.onPlayerProgress(event);
  }

  onPlayerPlay = () => {
    if (this.props.onPlayerPlay) this.props.onPlayerPlay();
  }

  onPlayerPause = () => {
    if (this.props.onPlayerPause) this.props.onPlayerPause();
  }

  onPlayerEnded = () => {
    if (this.props.onPlayerEnded) this.props.onPlayerEnded();
  }

  onPlayerSeek = (seconds) => {
    if (this.props.onPlayerSeek) this.props.onPlayerSeek(seconds);
  }


  render() {
    const video = this.props.video;

    let url;
    if (this.props.provider === 'youtube') {
      url = `https://www.youtube.com/watch?v=${video.id}`;
    }

    return (
      <div className="VideoDetail">
        <div className="embed-responsive embed-responsive-16by9">
          <ReactPlayer
            ref={this.playerRef}
            url={url}
            onReady={this.onPlayerReady}
            onStart={this.onPlayerStart}
            onProgress={this.onPlayerProgress}
            onPlay={this.onPlayerPlay}
            onPause={this.onPlayerPause}
            onEnded={this.onPlayerEnded}
            onSeek={this.onPlayerSeek}
            config={this.props.config}
            {...this.props.options}
          />
        </div>
      </div>
    );
  }
}

VideoDetail.propTypes = {
  video: PropTypes.object.isRequired,
  onPlayerReady: PropTypes.func,
  onPlayerStart: PropTypes.func,
  onPlayerProgress: PropTypes.func,
  onPlayerPlay: PropTypes.func,
  onPlayerPause: PropTypes.func,
  onPlayerSeek: PropTypes.func,
  options: PropTypes.object,
};

VideoDetail.defaultProps = {
  options: {
    'width': '100%',
    'height': '100%',
    'volume': 1,
  },
  config: {
    'youtube': {
      // https://developers.google.com/youtube/player_parameters
      playerVars: {
        autoplay: 1,
        start: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
      }
    }
  }
};

export default VideoDetail;