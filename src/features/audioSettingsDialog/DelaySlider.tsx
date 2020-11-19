import React from "react";

import { Typography } from "@material-ui/core";
import Slider from "@material-ui/core/Slider";
import * as types from "types";
import prettyMilliseconds from "pretty-ms";
import Tooltip from "@material-ui/core/Tooltip";
import MyMidiPlayer from "audio/midiPlayer";

interface IDelaySliderProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
}

export default function DelaySlider({
  midiPlayer,
  forceLocalRender,
}: IDelaySliderProps): JSX.Element {
  return (
    <div>
      <Tooltip
        title="Increasing this may help with performance"
        placement="top"
      >
        <Typography gutterBottom>Delay</Typography>
      </Tooltip>
      <Slider
        value={midiPlayer.getDelay()}
        min={0}
        step={0.001}
        max={0.1}
        valueLabelFormat={(value) => {
          return prettyMilliseconds(value * 1000, {
            formatSubMilliseconds: true,
          });
        }}
        onChange={(e, newValue) => {
          midiPlayer.setDelay(newValue as number);
          forceLocalRender(true);
        }}
        valueLabelDisplay="auto"
      />
    </div>
  );
}
