import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchContents, fetchTrackRecords } from "../actions/index";
import FilterableContentList from "../components/FilterableContentList";

class ContentListContainer extends Component {
  componentDidMount() {
    this.props.fetchContents();
    if (this.props.isAuthenticated) {
      this.props.fetchTrackRecords();
    };
  }

  render() {
    if (!this.props.contents) {
      return <div>Contents loading...</div>;
    }
    return (
      <FilterableContentList contents={this.props.contents} videos={this.props.videos} trackRecords={this.props.trackRecords} />
    );
  }

}

function mapStateToProps({ contents, videos, trackRecords, isAuthenticated }) {
  return { contents, videos, trackRecords, isAuthenticated };
}

export default connect(mapStateToProps, { fetchContents, fetchTrackRecords })(ContentListContainer);
