import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import ContentCurrent from "../components/ContentCurrent";
import FilterableContentList from "../components/FilterableContentList";
import "./Home.css";

class Home extends Component {
    render() {
        const currentContentId = this.props.currentContentId;
        const currentContent = this.props.contents[currentContentId];
        const currentVideo = this.props.videos[currentContentId];
        const currentTrackRecord = this.props.trackRecords[currentContentId];
        return (
            <div className="Home">
                <Row>
                    <Col xs={12} md={6}>
                        <ContentCurrent content={currentContent} video={currentVideo} trackRecord={currentTrackRecord} />
                    </Col>
                    <Col xs={12} md={1}></Col>
                    <Col xs={12} md={5}>
                        <FilterableContentList contents={this.props.contents} videos={this.props.videos} trackRecords={this.props.trackRecords} />
                    </Col>
                </Row>
            </div>
        );
    }
}

Home.propTypes = {
    contents: PropTypes.object.isRequired,
    videos: PropTypes.object.isRequired,
    trackRecords: PropTypes.object.isRequired,
    currentContentId: PropTypes.string.isRequired,
};

export default Home;