import React, { Component, Fragment } from "react";
import { Auth } from "aws-amplify";

import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import Routes from "./Routes";

import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import Grid from 'react-bootstrap/lib/Grid';

import { BounceLoader } from 'react-spinners';
import { FormattedMessage } from "react-intl";
import trFlag from "./img/turkey-flag-round.svg";
import ukFlag from "./img/united-kingdom-flag-round.svg";

import { updateAuth, userLogOut, setLocales } from "./actions";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticating: true,
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

  handleLanguageChange = (langCode) => {
    let locales;
    switch (langCode) {
      case 'en':
        locales = { locale: 'en-US', language: 'en' };
        break;
      case 'tr':
        locales = { locale: 'tr-TR', language: 'tr' };
        break;
      default:
        locales = { locale: 'en-US', language: 'en' };
    }
    this.props.setLocales(locales);
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
        <Navbar collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">PUPP</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav className="languages">
              <Fragment>
                <NavItem className="flag">
                  <img src={ukFlag} alt="English" onClick={() => this.handleLanguageChange('en')} />
                </NavItem>
                <NavItem className="flag">
                  <img src={trFlag} alt="Turkish" onClick={() => this.handleLanguageChange('tr')} />
                </NavItem>
              </Fragment>
            </Nav>
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
                  <LinkContainer to="/signup" id="signup">
                    <NavItem >
                      <FormattedMessage id="App.signup" /></NavItem>
                  </LinkContainer>
                  <LinkContainer to="/login" id="login">
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

function mapStateToProps({ isAuthenticated, preferences }, ownProps) {
  return { isAuthenticated, preferences };
}

export default withRouter(connect(mapStateToProps, { updateAuth, userLogOut, setLocales })(App));
