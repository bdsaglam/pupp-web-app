import { UPDATE_AUTH } from "../actions/types";

export function AuthReducer(state = false, action) {
    switch (action.type) {
        case UPDATE_AUTH:
            const isAuthenticated = action.payload;
            return isAuthenticated;
    }
    return state;
}