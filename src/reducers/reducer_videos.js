import { FETCH_VIDEO } from "../actions/types";

export function VideosReducer(state = {}, action) {
  switch (action.type) {
    case FETCH_VIDEO:
      return { ...state, [action.storeKey]: action.payload };
  }
  return state;
}
