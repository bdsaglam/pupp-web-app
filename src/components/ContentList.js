import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { getProgress } from "../libs/contentLib";
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
            const progress = getProgress({ content, trackRecord });

            return (
                <Link key={content.id} to={`/contents/${content.id}`}>
                    <ContentListItem key={content.id} content={content} video={video} progress={progress} />
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