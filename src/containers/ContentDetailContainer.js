import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchContent, fetchTrackRecord, updateTrackRecord } from "../actions";
import ContentDetail from "../components/ContentDetail";
import ContentDetailLoader from "../components/ContentDetailLoader";

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

  onBackHome = () => {
    this.props.history.push('/');
  }

  render() {
    if (!this.props.content || !this.props.video) {
      return <ContentDetailLoader />;
    }

    const trackRecord = this.props.trackRecord;
    var answers = trackRecord ? trackRecord.answers : {};
    return (
      <ContentDetail
        content={this.props.content}
        video={this.props.video}
        answers={answers}
        onUpdateAnswers={this.onUpdateAnswers}
        onBackHome={this.onBackHome}
      />
    );
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
