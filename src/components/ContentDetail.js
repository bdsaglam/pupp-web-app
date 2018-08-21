import React, { Component } from "react";
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faHome from "@fortawesome/fontawesome-free-solid/faHome";
import faUndoAlt from "@fortawesome/fontawesome-free-solid/faUndoAlt";

import LecturePanel from "./LecturePanel";
import LectureSummary from "./LectureSummary";
import "./ContentDetail.css";

class ContentDetail extends Component {
    constructor(props) {
        super(props);
        this.state = { showFinishModal: false, answers: this.props.answers };
    }

    onUpdateAnswers = (answers) => {
        this.props.onUpdateAnswers(answers);
    };

    onFinish = (answers) => {
        this.setState({ showFinishModal: true, answers: answers });
    };

    handleClose = () => {
        this.setState({ showFinishModal: false });
    };

    handleHome = () => {
        this.props.onBackHome();
    };

    render() {
        return (
            <div className="ContentDetail">
                <LecturePanel
                    content={this.props.content}
                    answers={this.props.answers}
                    maxAnswerAttempt={1}
                    onUpdateAnswers={this.onUpdateAnswers}
                    onFinish={this.onFinish}
                />
                <Modal show={this.state.showFinishModal} onHide={this.handleClose} dialogClassName="FinishModal">
                    <Modal.Header closeButton>
                        <Modal.Title>Summary</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <LectureSummary content={this.props.content} answers={this.props.answers} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleHome} bsStyle="success">
                            <FontAwesomeIcon icon={faHome} size={'2x'} color="#ffffff" />
                        </Button>
                        <Button onClick={this.handleClose} bsStyle="info">
                            <FontAwesomeIcon icon={faUndoAlt} size={'2x'} color="#ffffff" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

ContentDetail.propTypes = {
    content: PropTypes.object.isRequired,
    answers: PropTypes.object.isRequired,
    onUpdateAnswers: PropTypes.func.isRequired,
};

export default ContentDetail;