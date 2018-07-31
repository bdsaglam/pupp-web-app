import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faPlay from "@fortawesome/fontawesome-free-solid/faPlay";
import AnswerState from "../libs/AnswerState";
import Level from "./Level";
import placeholderImage from "../img/placeholder_image_video.png";
import "./ContentCurrent.css";

class ContentCurrent extends Component {
    render() {
        const { content, video, trackRecord } = this.props;
        if (!(content && video)) return (<div></div>);

        let source;
        if (video) {
            const thumbnails = video.snippet.thumbnails;
            if (thumbnails.high) {
                source = thumbnails.high.url;
            }
            else {
                source = thumbnails.default.url;
            }
        }
        else {
            source = placeholderImage;
        }

        let percentScore = 0;
        if (trackRecord) {
            const states = _.map(trackRecord.answers, answer => answer.state);
            const score = states.filter(s => (s === AnswerState.CORRECT)).length;
            percentScore = Math.floor(score / content.questions.length * 100);
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
            <div className="ContentCurrent">
                <h2>Continue...</h2>
                <Link key={content.id} to={`/contents/${content.id}`}>
                    <div className="Thumbnail">
                        <img src={source} alt="" />
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
        );
    }
}

ContentCurrent.propTypes = {
    content: PropTypes.object.isRequired,
    video: PropTypes.object,
    percentScore: PropTypes.number,
};


export default ContentCurrent;