import { UPDATE_AUTH, USER_LOGOUT } from "./types";

export function updateAuth(isAuthenticated) {
    return {
        type: UPDATE_AUTH,
        payload: isAuthenticated
    };
}

export function userLogOut() {
    return {
        type: USER_LOGOUT
    };
}

