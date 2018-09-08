import React, { Component } from "react";
import PropTypes from 'prop-types';
import Level from "./Level";
import ContentProgress from "./ContentProgress";

import placeholderImage from "../img/placeholder_image_video.png";
import "./ContentListItem.css";

class ContentListItem extends Component {
  render() {
    const { content, video, progress } = this.props;

    const arr = [].concat(content.skills).concat(content.scenario).slice(0, 5);
    const hashTag = arr.map(s => '#' + s).join(' ');

    let source;
    if (video) {
      source = video.snippet.thumbnails.default.url;
    }
    else {
      source = placeholderImage;
    }

    return (
      <li className="ContentListItem list-group-item">
        <div className="ContentItem media">
          <div className="media-left">
            <img className="media-object" src={source} alt="" />
          </div>
          <div className="media-body">
            <div className="media-info">
              <h4>{content.title}</h4>
              <Level level={content.level}></Level>
            </div>
            <div className="media-hashtag">
              <small className="text-muted">{hashTag}</small>
            </div>

            <ContentProgress
              percent={progress.percent}
              status={progress.status}
            />
          </div>
        </div>

      </li >
    );
  }
}

ContentListItem.propTypes = {
  content: PropTypes.object.isRequired,
  video: PropTypes.object,
  progress: PropTypes.object,
};


export default ContentListItem;