import { combineReducers } from "redux";
import { AuthReducer } from "./reducer_auth";
import { ContentsReducer } from "./reducer_contents";
import { VideosReducer } from "./reducer_videos";
import { TrackRecordsReducer } from "./reducer_trackrecords";
import { PreferencesReducer } from "./reducer_preferences";

const appReducer = combineReducers({
  isAuthenticated: AuthReducer,
  contents: ContentsReducer,
  videos: VideosReducer,
  trackRecords: TrackRecordsReducer,
  preferences: PreferencesReducer
});


const rootReducer = (state, action) => {
  if (action.type === "USER_LOGOUT") {
    state = Object.assign({}, state, { trackRecords: {} });
  }

  return appReducer(state, action);
};

export default rootReducer;