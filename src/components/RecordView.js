import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faMicrophone from "@fortawesome/fontawesome-free-solid/faMicrophone";
import SpeechRecognition from "./SpeechRecognition";
import "./RecordView.css";

class RecordView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      record: this.props.record,
    };
  }

  startRecording = () => {
    this.setState({
      record: true
    });
  }

  stopRecording = () => {
    this.setState({
      record: false
    });
  }

  onResult = (result) => {
    if (this.props.onResult) {
      this.props.onResult(result);
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({ record: newProps.record });
  }

  render() {
    let recordButton;
    if (this.state.record) {
      recordButton = (
        <Button
          className={"RecordButton Recording"}
          onClick={this.stopRecording}
        >
          <FontAwesomeIcon icon={faMicrophone} />
        </Button>
      );
    } else {
      recordButton = (
        <Button
          className={"RecordButton Still"}
          onClick={this.startRecording}
        >
          <FontAwesomeIcon icon={faMicrophone} />
        </Button>
      );
    }

    return (
      <div className="RecordView">
        <Row className="text-center">
          <SpeechRecognition
            onEnd={this.stopRecording}
            onResult={this.onResult}
            record={this.state.record}
          />
        </Row>
        <Row className="text-center">
          {recordButton}
        </Row>
      </div>
    );
  }
}

RecordView.propTypes = {
  onResult: PropTypes.func.isRequired,
  record: PropTypes.bool,
};

RecordView.defaultProps = {
  record: false,
};

export default RecordView;