import { combineReducers } from "@reduxjs/toolkit";

import { firebaseReducer } from "react-redux-firebase";

import midiPlayerStatus from "features/midiPlayerStatus/midiPlayerStatusSlice";
import fileName from "features/fileReader/fileReaderSlice";

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  midiPlayerStatus,
  fileName,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
