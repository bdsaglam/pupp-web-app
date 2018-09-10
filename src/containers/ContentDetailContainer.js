import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import { FormattedMessage } from "react-intl";

import { fetchContent, fetchTrackRecord, updateTrackRecord, doNotShowBrowserAlert } from "../actions";
import ContentDetail from "../components/ContentDetail";
import ContentDetailLoader from "../components/ContentDetailLoader";
import chromeIcon from "../img/chrome.svg";

import "./ContentDetailContainer.css";

class ContentDetailContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      doNotAskAgain: false,
      showBrowserAlert: !this.props.preferences.noBrowserAlert,
    };
  }

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

  handleCheckboxChange = (event) => {
    const value = event.target.value;
    this.setState({ doNotAskAgain: value });
  };

  handleClose = () => {
    if (this.state.doNotAskAgain) this.props.doNotShowBrowserAlert();
    this.setState({ showBrowserAlert: false });
  };

  handleDownload = () => {
    if (this.state.doNotAskAgain) this.props.doNotShowBrowserAlert();
    this.setState({ showBrowserAlert: false });
    this.props.history.push('/');
  };

  render() {
    if (this.state.showBrowserAlert) {
      return (
        <div>
          <Modal show={this.state.showBrowserAlert} onHide={this.handleClose} dialogClassName="BrowserModal">
            <Modal.Header closeButton>
              <Modal.Title><FormattedMessage id="App.browserModal.title" /></Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FormattedMessage id="App.browserModal.alertMessage" />
            </Modal.Body>
            <Modal.Footer>
              <Checkbox value={this.state.doNotAskAgain} onChange={this.handleCheckboxChange} inline>
                <FormattedMessage id="App.browserModal.doNotAskAgain" />
              </Checkbox>

              <a className="chrome" href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
                <Button onClick={this.handleDownload} >
                  <img src={chromeIcon} alt="Chrome" />
                  <FormattedMessage id="App.browserModal.downloadChrome" />
                </Button>
              </a>
              <Button onClick={this.handleClose}>
                <FormattedMessage id="App.browserModal.close" />
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }

    if (!this.props.content) {
      return <ContentDetailLoader />;
    }

    const trackRecord = this.props.trackRecord;
    var answers = trackRecord ? trackRecord.answers : {};
    return (
      <ContentDetail
        content={this.props.content}
        answers={answers}
        onUpdateAnswers={this.onUpdateAnswers}
        onBackHome={this.onBackHome}
      />
    );
  }
}

function mapStateToProps({ contents, trackRecords, isAuthenticated, preferences }, ownProps) {
  const id = ownProps.match.params.id;
  const content = contents[id];
  if (!content) {
    return { isAuthenticated, preferences };
  }

  const trackRecord = trackRecords[content.id];
  return { isAuthenticated, preferences, content, trackRecord };
}

export default connect(mapStateToProps, { fetchContent, fetchTrackRecord, updateTrackRecord, doNotShowBrowserAlert })(ContentDetailContainer);
