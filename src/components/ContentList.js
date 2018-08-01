import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import AnswerState from "../libs/AnswerState";
import ContentListItem from "./ContentListItem";
import "./ContentList.css";

class ContentList extends Component {
    renderContents() {
        if (_.isEmpty(this.props.contents)) {
            return <div>loading contents...</div>;
        }

        // map from object to array
        return _.map(this.props.contents, content => {
            const video = this.props.videos[content.id];
            const trackRecord = this.props.trackRecords[content.id];
            let percentScore = 0;
            if (trackRecord) {
                const states = _.map(trackRecord.answers, answer => answer.state);
                const score = states.filter(s => (s === AnswerState.CORRECT)).length;
                percentScore = Math.floor(score / content.questions.length * 100);
            }

            return (
                <Link key={content.id} to={`/contents/${content.id}`}>
                    <ContentListItem content={content} video={video} key={content.id} percentScore={percentScore} />
                </Link>
            );
        });
    }

    render() {
        return (
            <div className="ContentList">
                <ul className="list-group">
                    {this.renderContents()}
                </ul>
            </div>
        );
    }
}

ContentList.propTypes = {
    contents: PropTypes.object.isRequired,
    videos: PropTypes.object.isRequired,
};

export default ContentList;