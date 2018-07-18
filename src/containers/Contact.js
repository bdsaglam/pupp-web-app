import React, { Component } from "react";
import { Auth } from "aws-amplify";
import { API } from "aws-amplify";
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { DotLoader } from 'react-spinners';

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
                "",
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
                        <p>Thank you for getting in touch! We'll do our best to fulfill your request.</p>
                        <p>Have a great day!</p>
                    </div>
                    <div className="RedirectSpinner">
                        <DotLoader
                            color={"#29c7a8"}
                            loading={true}
                        />
                    </div>
                    <div className="RedirectMessage">
                        redirecting to home in a few seconds
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
                                <ControlLabel>Email <small>(required)</small></ControlLabel>
                                <FormControl
                                    autoFocus
                                    type="email"
                                    value={this.state.email}
                                    onChange={this.handleChange}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                            <FormGroup controlId="name" validationState={this.getValidationState("name")} bsSize="small">
                                <ControlLabel>Name <small>(required)</small></ControlLabel>
                                <FormControl
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    type="text"
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                            <FormGroup controlId="message" bsSize="large">
                                <ControlLabel>Your message</ControlLabel>
                                <FormControl
                                    value={this.state.message}
                                    onChange={this.handleChange}
                                    componentClass="textarea"
                                    placeholder="Your opinion matters for us."
                                />
                            </FormGroup>
                            <FormGroup controlId="contentRequest" bsSize="large">
                                <ControlLabel>Request a content</ControlLabel>
                                <FormControl
                                    value={this.state.contentRequest}
                                    onChange={this.handleChange}
                                    type="text"
                                    placeholder="Please write the link of material, video, game etc. that you want to see in our platform."
                                />
                            </FormGroup>
                            <LoaderButton
                                block
                                bsSize="large"
                                disabled={!this.validateForm()}
                                type="submit"
                                isLoading={this.state.isLoading}
                                text="Send"
                                loadingText="Sending..."
                            />
                        </form>
                    </Col>
                </Row>

            </div>
        );
    }
}

export default Contact;