import React from "react";

import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Slider from "@material-ui/core/Slider";

import MyMidiPlayer from "audio/midiPlayer";
import * as types from "types";

interface IOtherSettingsProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
  synthIndex: number;
}

export default function OtherSettings({
  midiPlayer,
  forceLocalRender,
  synthIndex
}: IOtherSettingsProps) {
  const settings = midiPlayer.myTonejs?.getSynthSettings(synthIndex)?.others;

  return (
    <div>
      <Typography>Misc</Typography>
      {settings && (
        <div>
          <InputLabel>Detune</InputLabel>
          <Slider
            value={settings.detune}
            min={-60}
            step={1}
            max={60}
            onChange={(e, newValue) => {
              midiPlayer.myTonejs?.setSynthSettingsOther("detune", newValue, synthIndex);
              forceLocalRender();
            }}
            valueLabelDisplay="auto"
          />
          <InputLabel>Volume</InputLabel>
          <Slider
            value={settings.volume}
            min={-30}
            step={1}
            max={30}
            onChange={(e, newValue) => {
              midiPlayer.myTonejs?.setSynthSettingsOther("volume", newValue, synthIndex);
              forceLocalRender();
            }}
            valueLabelDisplay="auto"
          />
        </div>
      )}
    </div>
  );
}
