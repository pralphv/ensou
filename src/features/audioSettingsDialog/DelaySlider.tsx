import React from "react";

import InputLabel from "@material-ui/core/InputLabel";
import Slider from "@material-ui/core/Slider";
import * as types from "types";
import prettyMilliseconds from "pretty-ms";
import Tooltip from "@material-ui/core/Tooltip";
import MyMidiPlayer from "audio/midiPlayer";

interface IDelaySliderProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
  synthIndex: number;
}

export default function DelaySlider({
  midiPlayer,
  forceLocalRender,
  synthIndex,
}: IDelaySliderProps): JSX.Element {
  return (
    <div>
      <Tooltip
        title="Increasing this may help with performance"
        placement="top"
      >
        <InputLabel>Delay</InputLabel>
      </Tooltip>
      {midiPlayer.myTonejs && (
        <Slider
          value={midiPlayer.myTonejs.getDelay(synthIndex)}
          min={0.01}
          step={0.001}
          max={0.1}
          valueLabelFormat={(value) => {
            return prettyMilliseconds(value * 1000, {
              formatSubMilliseconds: true,
            });
          }}
          onChange={(e, newValue) => {
            midiPlayer.myTonejs?.setDelay(newValue as number, synthIndex);
            forceLocalRender(true);
          }}
          valueLabelDisplay="auto"
        />
      )}
    </div>
  );
}
