import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import Level from "./Level";

import placeholderImage from "../img/placeholder_image_video.png";
import "./ContentListItem.css";

class ContentListItem extends Component {
  render() {
    const { content, video, percentScore } = this.props;

    let source;
    if (video) {
      source = video.snippet.thumbnails.default.url;
    }
    else {
      source = placeholderImage;
    }

    let status;
    if (percentScore > 90) {
      status = "success";
    }
    else if (percentScore > 60) {
      status = "good";
    }
    else if (percentScore > 0) {
      status = "active";
    }
    else {
      status = "default";
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

            <Progress
              percent={percentScore}
              status={status}
              theme={{
                success: {
                  symbol: '😎',
                  color: "#27ae60"
                },
                good: {
                  symbol: '😀',
                  color: "#2ecc71"
                },
                active: {
                  symbol: '🤔',
                  color: '#3498db'
                },
                default: {
                  symbol: '😴',
                  color: '#fbc630'
                }
              }}
            />
          </div>
        </div>

      </li>
    );
  }
}

ContentListItem.propTypes = {
  content: PropTypes.object.isRequired,
  video: PropTypes.object,
  percentScore: PropTypes.number,
};


export default ContentListItem;