import React from "react";
import ReactDOM from "react-dom";
import Amplify from "aws-amplify";
import { BrowserRouter } from "react-router-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from 'redux-thunk';

import { addLocaleData, IntlProvider } from "react-intl";
import en from "react-intl/locale-data/en";
import tr from "react-intl/locale-data/tr";
import es from "react-intl/locale-data/es";
import { flattenMessages } from "./libs/Utils";
import messages from "./messages";

import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import config from "./config";
import "./index.css";
import rootReducer from "./reducers";


addLocaleData([...en, ...tr, ...es]);

const locale =
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  navigator.userLanguage ||
  'en-US';

const language = locale.toLowerCase().split(/[_-]+/)[0];


Amplify.configure(config);

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);


ReactDOM.render(
  <Provider store={store}>
    <IntlProvider locale={locale} messages={flattenMessages(messages[language])}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </IntlProvider>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
