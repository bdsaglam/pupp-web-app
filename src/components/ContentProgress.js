import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

class ContentProgress extends Component {
    render() {
        const { status, percent } = this.props;

        return (
            <Progress
                percent={percent}
                status={status}
                theme={{
                    success: {
                        symbol: '😎',
                        color: "#27ae60"
                    },
                    good: {
                        symbol: '😀',
                        color: "#2ecc71"
                    },
                    started: {
                        symbol: '🙂',
                        color: '#3498db'
                    },
                    active: {
                        symbol: '🤔',
                        color: "#bdc3c7"
                    },
                    default: {
                        symbol: '😴',
                        color: '#fbc630'
                    }
                }}
            />
        );
    }
}

ContentProgress.propTypes = {
    status: PropTypes.string,
    percent: PropTypes.number,
};


export default ContentProgress;