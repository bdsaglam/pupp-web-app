import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faMicrophone from "@fortawesome/fontawesome-free-solid/faMicrophone";

import Recognizer from "../libs/Recognizer";
import "./RecognitionView.css";

class RecognitionView extends Component {
  constructor(props) {
    super(props);

    this.recognizer = new Recognizer({
      onStart: this.onStart,
      onEnd: this.onEnd,
      onError: this.onError,
      onResult: this.onResult,
      options: this.props.options,
    });

    // initial state
    this.initialState = {
      text: "...",
    };
    this.state = Object.assign({ record: this.props.record }, this.initialState);
  }

  start = () => {
    this.recognizer.start();
    this.setState({
      record: true
    });
  }

  stop = () => {
    this.recognizer.stop();
    this.setState({
      record: false
    });
  }

  abort = () => {
    this.recognizer.abort();
    this.setState({
      record: false
    });
  }

  onStart = () => {

  }

  onEnd = () => {

  }

  onError = () => {

  }

  onResult = (result) => {
    this.setState({
      text: result.finalTranscript,
    });
    if (this.props.onResult) {
      this.props.onResult(result);
    }
  }


  componentWillReceiveProps(props) {
    if (props.record) {
      this.recognizer.start();
    } else {
      this.recognizer.abort();
    }

    this.setState(Object.assign({}, this.initialState, { record: props.record }));
  }

  componentWillUnmount() {
    this.recognizer.abort();
  }

  render() {
    let recordButton;
    if (this.state.record) {
      recordButton = (
        <Button
          className={"RecordButton Recording"}
          onClick={this.stop}
        >
          <FontAwesomeIcon icon={faMicrophone} />
        </Button>
      );
    } else {
      recordButton = (
        <Button
          className={"RecordButton Still"}
          onClick={this.start}
        >
          <FontAwesomeIcon icon={faMicrophone} />
        </Button>
      );
    }

    return (
      <div className="RecognitionView">
        <Row>
          <div className="text-center">
            {this.state.text}
          </div>
        </Row>
        <Row className="text-center">
          {recordButton}
        </Row>
      </div>
    );
  }
}

RecognitionView.propTypes = {
  onResult: PropTypes.func.isRequired,
  record: PropTypes.bool,
};

RecognitionView.defaultProps = {
  record: false,
};

export default RecognitionView;