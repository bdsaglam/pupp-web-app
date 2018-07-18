import _ from "lodash";
import {
  FETCH_TRACKRECORDS, FETCH_TRACKRECORD,
  CREATE_TRACKRECORD, UPDATE_TRACKRECORD, DELETE_TRACKRECORD
} from "../actions/types";

export function TrackRecordsReducer(state = {}, action) {
  switch (action.type) {
    case FETCH_TRACKRECORDS:
      // map from array to obj
      return _.mapKeys(action.payload, "contentId");
    case FETCH_TRACKRECORD:
      return { ...state, [action.payload.contentId]: action.payload };
    case CREATE_TRACKRECORD:
      return { ...state, [action.payload.contentId]: action.payload };
    case UPDATE_TRACKRECORD:
      return { ...state, [action.payload.contentId]: action.payload };
    case DELETE_TRACKRECORD:
      var nstate = Object.assign({}, state);
      delete nstate[action.payload.contentId];
      return nstate;
    default:
      return state;
  }
}
