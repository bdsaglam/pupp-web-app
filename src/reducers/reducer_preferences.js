import { SET_LOCALES, NO_BROWSER_ALERT } from "../actions/types";

// check locale info
const locale = (
    localStorage.getItem('locale') ||
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage ||
    'en-US'
);

const language = locale.toLowerCase().split(/[_-]+/)[0];

// check browser type and user's do not show preference
const noBrowserAlert = localStorage.getItem('noBrowserAlert') || (!!window.chrome && !!window.chrome.webstore);

const initialState = { locale: locale, language: language, noBrowserAlert: noBrowserAlert };

export function PreferencesReducer(state = initialState, action) {
    switch (action.type) {
        case NO_BROWSER_ALERT:
            return Object.assign({}, state, action.payload);
        case SET_LOCALES:
            return Object.assign({}, state, action.payload);
    }
    return state;
}


