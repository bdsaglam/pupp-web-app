import React, { Component, Fragment } from "react";
import { Auth } from "aws-amplify";
import { connect } from "react-redux";

import { Link, withRouter } from "react-router-dom";
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import Grid from 'react-bootstrap/lib/Grid';
import { LinkContainer } from "react-router-bootstrap";
import { FormattedMessage } from "react-intl";
import { BounceLoader } from 'react-spinners';

import "./App.css";

import Routes from "./Routes";
import { updateAuth, userLogOut } from "./actions";


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticating: true
    };
  }

  handleLogout = async event => {
    await Auth.signOut();

    this.props.updateAuth(false);
    this.props.userLogOut();
    this.props.history.push("/login");
  }

  async componentDidMount() {
    try {
      if (await Auth.currentSession()) {
        this.props.updateAuth(true);
      }
    }
    catch (e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }

    this.setState({ isAuthenticating: false });
  }

  render() {
    if (this.state.isAuthenticating) {
      return (
        <div className="App Loading">
          <div className="LoginMessage">
            Logging in...
          </div>
          <div className="LoginSpinner">
            <BounceLoader
              color={"#29c7a8"}
              loading={true}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="App">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">pupp</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <Fragment>
                <LinkContainer to="/contact">
                  <NavItem><FormattedMessage id="App.contact" /></NavItem>
                </LinkContainer>
              </Fragment>
            </Nav>
            <Nav pullRight>
              {this.props.isAuthenticated
                ? <Fragment>
                  <LinkContainer to="/settings">
                    <NavItem><FormattedMessage id="App.settings" /></NavItem>
                  </LinkContainer>
                  <NavItem onClick={this.handleLogout}>
                    <FormattedMessage id="App.logout" />
                  </NavItem>
                </Fragment>
                : <Fragment>
                  <LinkContainer to="/signup">
                    <NavItem><FormattedMessage id="App.signup" /></NavItem>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <NavItem><FormattedMessage id="App.login" /></NavItem>
                  </LinkContainer>
                </Fragment>
              }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Grid>
          <Routes isAuthenticated={this.props.isAuthenticated} />
        </Grid>
      </div>
    );
  }
}

function mapStateToProps({ isAuthenticated }, ownProps) {
  return { isAuthenticated };
}

export default withRouter(connect(mapStateToProps, { updateAuth, userLogOut })(App));
