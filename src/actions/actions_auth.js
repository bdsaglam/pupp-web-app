import { UPDATE_AUTH } from "./types";

export function updateAuth(isAuthenticated) {
    return {
        type: UPDATE_AUTH,
        payload: isAuthenticated
    };
}