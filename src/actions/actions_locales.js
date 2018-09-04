import { SET_LOCALES } from "./types";

export function setLocales(locales) {
    localStorage.setItem('locale', locales.locale);

    return {
        type: SET_LOCALES,
        payload: locales
    };
}
