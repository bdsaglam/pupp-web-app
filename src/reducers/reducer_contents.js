import _ from "lodash";
import { FETCH_CONTENTS, FETCH_CONTENT } from "../actions/types";

export function ContentsReducer(state = {}, action) {
  switch (action.type) {
    case FETCH_CONTENTS:
      // map from array to obj
      return _.mapKeys(action.payload, "id");
    case FETCH_CONTENT:
      return { ...state, [action.payload.id]: action.payload };
    default:
      return state;
  }
}
