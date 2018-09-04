import React from "react";
import ReactDOM from "react-dom";
import Amplify from "aws-amplify";
import config from "./config";
import { BrowserRouter } from "react-router-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from 'redux-thunk';
import rootReducer from "./reducers";

import { addLocaleData } from "react-intl";
import en from "react-intl/locale-data/en";
import tr from "react-intl/locale-data/tr";
import ConnectedIntlProvider from './containers/ConnectedIntlProvider';

import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

// locale config
addLocaleData([...en, ...tr]);

// AWS SDK config
Amplify.configure(config);

// redux + initialState + thunk middleware
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedIntlProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConnectedIntlProvider>
  </Provider>,
  document.getElementById("root")
);

registerServiceWorker();
