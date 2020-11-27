import React from "react";

import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import prettyMilliseconds from "pretty-ms";
import Slider from "@material-ui/core/Slider";

import MyMidiPlayer from "audio/midiPlayer";
import * as types from "types";

interface IOtherSettingsProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
}

export default function OtherSettings({
  midiPlayer,
  forceLocalRender,
}: IOtherSettingsProps) {
  const settings = midiPlayer.myTonejs?.getSynthSettings()?.others;

  return (
    <div>
      <Typography>Misc</Typography>
      {settings && (
        <div>
          <InputLabel>Detune</InputLabel>
          <Slider
            value={settings.detune}
            min={-1500}
            step={1}
            max={1500}
            onChange={(e, newValue) => {
              midiPlayer.myTonejs?.setSynthSettingsOther("detune", newValue);
              forceLocalRender();
            }}
            valueLabelDisplay="auto"
          />
        </div>
      )}
    </div>
  );
}
