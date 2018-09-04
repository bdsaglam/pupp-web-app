import { SET_LOCALES } from "../actions/types";

const locale = (
    localStorage.getItem('locale') ||
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage ||
    'en-US'
);

const language = locale.toLowerCase().split(/[_-]+/)[0];

const initialState = { locale: locale, language: language };

export function LocalesReducer(state = initialState, action) {
    switch (action.type) {
        case SET_LOCALES:
            const locales = action.payload;
            return locales;
    }
    return state;
}