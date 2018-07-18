import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Recognizer from "../libs/Recognizer";

class SpeechRecognition extends Component {
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
        this.state = Object.assign({}, this.initialState);
    }

    onStart = () => {
        if (this.props.onStart) {
            this.props.onStart();
        }
    }

    onEnd = () => {
        if (this.props.onEnd) {
            this.props.onEnd();
        }
    }

    onError = () => {
        if (this.props.onError) {
            this.props.onError();
        }
    }

    onResult = (result) => {
        this.props.onResult(result);
        this.setState({
            text: result.finalTranscript,
        });
    }

    start = () => {
        this.recognizer.start();

    }

    stop = () => {
        this.recognizer.stop();
    }

    abort = () => {
        this.recognizer.abort();
    }

    componentWillReceiveProps(props) {
        this.setState(this.initialState);
        if (props.record) {
            this.start();
        } else {
            this.abort();
        }
    }

    componentWillUnmount() {
        this.abort();
    }

    render() {
        return (
            <div className="SpeechRecognition text-center">
                {this.state.text}
            </div>
        );
    }
}

SpeechRecognition.propTypes = {
    onResult: PropTypes.func.isRequired,
    record: PropTypes.bool.isRequired,
    onStart: PropTypes.func,
    onEnd: PropTypes.func,
    onError: PropTypes.func,
    options: PropTypes.object,
};

export default SpeechRecognition;