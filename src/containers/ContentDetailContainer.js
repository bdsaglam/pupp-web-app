import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchContent, fetchTrackRecord, updateTrackRecord } from "../actions";
import LecturePanel from "./LecturePanel";

class ContentDetailContainer extends Component {
  componentDidMount() {
    const id = this.props.match.params.id;
    if (!this.props.content) {
      this.props.fetchContent(id);
    }

    if (this.props.isAuthenticated) {
      if (!this.props.trackRecord) this.props.fetchTrackRecord(id);
    }
  }

  onUpdateAnswers = (answers) => {
    if (!this.props.isAuthenticated) return;

    const trackRecord = { contentId: this.props.content.id, answers: answers };
    this.props.updateTrackRecord(trackRecord);
  };

  render() {
    if (!this.props.content || !this.props.video) {
      return <div>Content loading...</div>;
    }
    const trackRecord = this.props.trackRecord;
    var answers = trackRecord ? trackRecord.answers : {};
    return <LecturePanel content={this.props.content} video={this.props.video} answers={answers} onUpdateAnswers={this.onUpdateAnswers} />;
  }
}

function mapStateToProps({ contents, videos, trackRecords, isAuthenticated }, ownProps) {
  const id = ownProps.match.params.id;
  const content = contents[id];
  if (!content) {
    return { isAuthenticated };
  }
  const video = videos[content.id];
  const trackRecord = trackRecords[content.id];
  return { content, video, trackRecord, isAuthenticated };
}

export default connect(mapStateToProps, { fetchContent, fetchTrackRecord, updateTrackRecord })(ContentDetailContainer);
