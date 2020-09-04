import React from "react";
import { RootState } from "app/rootReducer";
import { useSelector, useDispatch } from "react-redux";

import { makeStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";

import { setTempoChange } from "features/midiPlayerStatus/midiPlayerStatusSlice";
import { MidiStatus } from "features/midiPlayerStatus/constants";

const useStyles = makeStyles({
  slider: {
    width: 100,
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
});

function TempoChange() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const tempo: number = useSelector(
    (state: RootState) => state.midiPlayerStatus.tempo
  );
  const midiPlayerStatus: string = useSelector(
    (state: RootState) => state.midiPlayerStatus.status
  );

  const handleChange = (e: any, newValue: number | number[]) => {
    dispatch(setTempoChange(newValue as number));
  };

  return (
    <Slider
      color="secondary"
      value={tempo}
      onChange={handleChange}
      disabled={midiPlayerStatus === MidiStatus.Playing}
      max={200}
      className={classes.slider}
    />
  );
}

export default TempoChange;
