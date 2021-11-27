import React from "react";

import { Typography } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import Slider from "@mui/material/Slider";

import myMidiPlayer from "audio";
import * as types from "types";

interface IOtherSettingsProps {
  forceLocalRender: types.forceLocalRender;
  synthIndex: number;
}

export default function OtherSettings({
  forceLocalRender,
  synthIndex,
}: IOtherSettingsProps) {
  const settings = myMidiPlayer.myTonejs?.getSynthSettings(synthIndex)?.others;

  return (
    <div>
      <Typography>Misc</Typography>
      {settings && (
        <div>
          <InputLabel>Detune</InputLabel>
          <Slider
            size="small"
            value={settings.detune}
            min={-60}
            step={1}
            max={60}
            onChange={(e, newValue) => {
              myMidiPlayer.myTonejs?.setSynthSettingsOther(
                "detune",
                newValue,
                synthIndex
              );
              forceLocalRender();
            }}
            valueLabelDisplay="auto"
          />
          <InputLabel>Volume</InputLabel>
          <Slider
            size="small"
            value={settings.volume}
            min={-30}
            step={1}
            max={30}
            onChange={(e, newValue) => {
              myMidiPlayer.myTonejs?.setSynthSettingsOther(
                "volume",
                newValue,
                synthIndex
              );
              forceLocalRender();
            }}
            valueLabelDisplay="auto"
          />
        </div>
      )}
    </div>
  );
}
