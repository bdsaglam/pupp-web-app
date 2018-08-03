import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchContents, fetchTrackRecords } from "../actions/index";
import { recommendContent } from "../libs/contentLib";
import Home from "../components/Home";
import HomeLoader from "../components/HomeLoader";

class HomeContainer extends Component {
  componentDidMount() {
    this.props.fetchContents();
    if (this.props.isAuthenticated) {
      this.props.fetchTrackRecords();
    };
  }

  render() {
    if (!this.props.contents || _.isEmpty(this.props.contents)) {
      return <HomeLoader />;
    }

    const currentContentId = recommendContent(this.props.contents, this.props.trackRecords);
    return (
      <Home contents={this.props.contents} videos={this.props.videos} trackRecords={this.props.trackRecords} currentContentId={currentContentId} />
    );
  }

}

function mapStateToProps({ contents, videos, trackRecords, isAuthenticated }) {
  return { contents, videos, trackRecords, isAuthenticated };
}

export default connect(mapStateToProps, { fetchContents, fetchTrackRecords })(HomeContainer);
