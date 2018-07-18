import { combineReducers } from "redux";
import { AuthReducer } from "./reducer_auth";
import { ContentsReducer } from "./reducer_contents";
import { VideosReducer } from "./reducer_videos";
import { TrackRecordsReducer } from "./reducer_trackrecords";

const rootReducer = combineReducers({
  isAuthenticated: AuthReducer,
  contents: ContentsReducer,
  videos: VideosReducer,
  trackRecords: TrackRecordsReducer,
});

export default rootReducer;