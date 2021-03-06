import React, { Component } from "react";
import { Auth } from "aws-amplify";
import { API } from "aws-amplify";
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { DotLoader } from 'react-spinners';
import { FormattedMessage } from "react-intl";

import LoaderButton from "../components/LoaderButton";
import "./Contact.css";

class Contact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isSuccessfullySent: false,
            redirecting: false,
            email: "",
            name: "",
            message: "",
            contentRequest: ""

        };
    }

    loadUserInfo = async () => {
        try {
            let userInfo = await Auth.currentUserInfo();
            if (userInfo) {
                const email = userInfo.attributes.email || "";
                const name = userInfo.attributes.name || "";
                this.setState({ email, name });
            }
        } catch (error) {
            console.log(error);
        }
    }

    getValidationState = (fieldName) => {
        const length = this.state[fieldName].length;
        if (length > 0) return 'success';
        else return 'error';
    }

    validateForm = () => {
        return this.state.email.length > 0 && this.state.name.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleSubmit = async event => {
        event.preventDefault();
        if (!this.validateForm()) return;

        this.setState({ isLoading: true });

        const body = {
            email: this.state.email,
            name: this.state.name,
            message: this.state.message,
            contentRequest: this.state.contentRequest,
        };

        try {
            await API.post(
                "ContactAPI",
                "/contact",
                { body: body }
            );
            this.setState({ isLoading: false, isSuccessfullySent: true });
        } catch (e) {
            console.log(e);
            console.log(e.response);
            alert(e);
            this.setState({ isLoading: false });
        }
    }

    componentDidUpdate() {
        if (this.state.isSuccessfullySent && !this.state.redirecting) {
            this.setState({ redirecting: true });
            setTimeout(() => this.props.history.push('/'), 3000);
        }
    }

    componentDidMount() {
        this.loadUserInfo();
    }

    render() {
        if (this.state.isSuccessfullySent) {
            return (
                <div className="ContactSuccessful">
                    <div className="ThanksMessage">
                        <p><FormattedMessage id="Contact.thanksMessage" /></p>
                        <p><FormattedMessage id="Contact.greatDay" /></p>
                    </div>
                    <div className="RedirectSpinner">
                        <DotLoader
                            color={"#29c7a8"}
                            loading={true}
                        />
                    </div>
                    <div className="RedirectMessage">
                        <FormattedMessage id="Contact.redirectMessage" />
                    </div>
                </div>
            );
        }

        return (
            <div className="Contact">
                <Row>
                    <Col md={8} mdOffset={2}>
                        <form onSubmit={this.handleSubmit}>
                            <FormGroup controlId="email" validationState={this.getValidationState("email")} bsSize="small">
                                <ControlLabel>
                                    <FormattedMessage id="Contact.email" />
                                    <small> (<FormattedMessage id="Contact.required" />)</small>
                                </ControlLabel>
                                <FormControl
                                    autoFocus
                                    type="email"
                                    value={this.state.email}
                                    onChange={this.handleChange}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                            <FormGroup controlId="name" validationState={this.getValidationState("name")} bsSize="small">
                                <ControlLabel>
                                    <FormattedMessage id="Contact.name" />
                                    <small> (<FormattedMessage id="Contact.required" />)</small>
                                </ControlLabel>
                                <FormControl
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    type="text"
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                            <FormGroup controlId="message" bsSize="large">
                                <ControlLabel><FormattedMessage id="Contact.message" /></ControlLabel>
                                <FormControl
                                    value={this.state.message}
                                    onChange={this.handleChange}
                                    componentClass="textarea"
                                    placeholder="Your opinions matter for us"
                                />
                            </FormGroup>
                            <FormGroup controlId="contentRequest" bsSize="large">
                                <ControlLabel><FormattedMessage id="Contact.suggest" /></ControlLabel>
                                <FormControl
                                    value={this.state.contentRequest}
                                    onChange={this.handleChange}
                                    type="text"
                                    placeholder="http://..."
                                />
                            </FormGroup>
                            <LoaderButton
                                block
                                bsSize="large"
                                disabled={!this.validateForm()}
                                type="submit"
                                isLoading={this.state.isLoading}
                                text={<FormattedMessage id="Contact.sendMessage" />}
                                loadingText={<FormattedMessage id="Contact.sendingMessage" />}
                            />
                        </form>
                    </Col>
                </Row>

            </div>
        );
    }
}

export default Contact;