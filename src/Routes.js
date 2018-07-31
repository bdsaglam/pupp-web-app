import React from "react";
import { Route, Switch } from "react-router-dom";

import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Contact from "./containers/Contact";
import HomeContainer from "./containers/HomeContainer";
import ContentDetailContainer from "./containers/ContentDetailContainer";
import NotFound from "./containers/NotFound";

import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";


export default ({ isAuthenticated }) => (
  <Switch>
    <UnauthenticatedRoute path="/login" exact component={Login} isAuthenticated={isAuthenticated} />
    <UnauthenticatedRoute path="/signup" exact component={Signup} isAuthenticated={isAuthenticated} />
    <Route path="/contact" exact component={Contact} />
    <Route path="/" exact component={HomeContainer} />
    <Route path="/contents/:id" exact component={ContentDetailContainer} />
    { /* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>
);
