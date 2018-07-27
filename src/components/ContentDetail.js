
import React, { Component } from "react";
import PropTypes from 'prop-types';
import LecturePanel from "./LecturePanel";
import "./ContentDetail.css";

class ContentDetail extends Component {
    constructor(props) {
        super(props);
        this.state = { showFinishModal: false };
    }

    onLectureEnd = () => {
        this.setState({ showFinishModal: true });
    };

    render() {
        return (
            <div className="ContentDetail">
                <LecturePanel
                    content={this.props.content}
                    video={this.props.video}
                    answers={this.props.answers}
                    onUpdateAnswers={this.props.onUpdateAnswers}
                    onEnd={this.onLectureEnd}
                    maxAnswerAttempt={1}
                />
            </div>
        );
    }
}

ContentDetail.propTypes = {
    content: PropTypes.object.isRequired,
    video: PropTypes.object.isRequired,
    answers: PropTypes.object.isRequired,
    onUpdateAnswers: PropTypes.func.isRequired,
};

export default ContentDetail;