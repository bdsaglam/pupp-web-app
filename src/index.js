import React from "react";
import ReactDOM from "react-dom";
import Amplify from "aws-amplify";
import { BrowserRouter } from "react-router-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from 'redux-thunk';

import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import stack from "./stack";
import "./index.css";

import rootReducer from "./reducers";

Amplify.configure(stack);

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);


ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
