import { combineReducers } from "redux";
import userReducer from "./user/reducer";
import partyReducer from "./party/reducer";
import notificationReducer from "./notifications/reducer";
import storyReducer from "./story/reducer";

const rootReducer = combineReducers({
  notification: notificationReducer,
  party: partyReducer,
  user: userReducer,
  story: storyReducer,
});

export default rootReducer;
