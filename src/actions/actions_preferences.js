import { SET_LOCALES, NO_BROWSER_ALERT } from "./types";

export function setLocales(locales) {
    localStorage.setItem('locale', locales.locale);

    return {
        type: SET_LOCALES,
        payload: locales
    };
}

export function doNotShowBrowserAlert() {
    localStorage.setItem('noBrowserAlert', true);

    return {
        type: NO_BROWSER_ALERT,
        payload: { noBrowserAlert: true }
    };
}