import { combineReducers } from "redux";
import { AuthReducer } from "./reducer_auth";
import { ContentsReducer } from "./reducer_contents";
import { VideosReducer } from "./reducer_videos";
import { TrackRecordsReducer } from "./reducer_trackrecords";

const appReducer = combineReducers({
  isAuthenticated: AuthReducer,
  contents: ContentsReducer,
  videos: VideosReducer,
  trackRecords: TrackRecordsReducer,
});


const rootReducer = (state, action) => {
  if (action.type === "USER_LOGOUT") {
    // if (!action.payload) {
    //   state = Object.assign({}, state, { trackRecords: {} });
    // }
    state = Object.assign({}, state, { trackRecords: {} });
  }

  return appReducer(state, action);
};

export default rootReducer;