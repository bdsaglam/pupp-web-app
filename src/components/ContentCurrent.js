import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faPlay from "@fortawesome/fontawesome-free-solid/faPlay";
import { getProgress } from "../libs/contentLib";
import Level from "./Level";
import ContentProgress from "./ContentProgress";
import placeholderImage from "../img/placeholder_image_video.png";
import "./ContentCurrent.css";

class ContentCurrent extends Component {
    render() {
        const { content, video, trackRecord } = this.props;

        let thumbnailSrc;
        if (video) {
            const thumbnails = video.snippet.thumbnails;
            if (thumbnails.medium) {
                thumbnailSrc = thumbnails.medium.url;
            }
            else {
                thumbnailSrc = thumbnails.default.url;
            }
        }
        else {
            thumbnailSrc = "http://via.placeholder.com/320x180/000000?text=%20";
        }

        const progress = getProgress({ content, trackRecord });

        return (
            <div className="ContentCurrent">
                <h2>Continue...</h2>
                <Link key={content.id} to={`/contents/${content.id}`}>
                    <div className="Thumbnail">
                        <img src={thumbnailSrc} alt="" />
                        <div className="PlayIcon">
                            <FontAwesomeIcon icon={faPlay} color="white" size="2x" />
                        </div>
                    </div>
                </Link>
                <div className="Caption">
                    <div>
                        <h3>{content.title}</h3>
                        <h4>{content.emojiTitle}</h4>
                    </div>
                    <Level level={content.level}></Level>
                </div>
                <ContentProgress
                    percent={progress.percent}
                    status={progress.status}
                />
            </div>
        );
    }
}

ContentCurrent.propTypes = {
    content: PropTypes.object.isRequired,
    video: PropTypes.object,
    trackRecord: PropTypes.object,
};


export default ContentCurrent;