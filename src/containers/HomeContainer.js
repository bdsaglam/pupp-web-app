import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchContents, fetchTrackRecords } from "../actions/index";
import Home from "../components/Home";

class HomeContainer extends Component {
  componentDidMount() {
    this.props.fetchContents();
    if (this.props.isAuthenticated) {
      this.props.fetchTrackRecords();
    };
  }

  render() {
    console.log("HomeContainer props");
    console.log(this.props);
    if (!this.props.contents) {
      return <div>Contents loading...</div>;
    }
    return (
      <Home contents={this.props.contents} videos={this.props.videos} trackRecords={this.props.trackRecords} currentContentId={"2"}/>
    );
  }

}

function mapStateToProps({ contents, videos, trackRecords, isAuthenticated }) {
  return { contents, videos, trackRecords, isAuthenticated };
}

export default connect(mapStateToProps, { fetchContents, fetchTrackRecords })(HomeContainer);
