import React from "react";

import { Typography } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import Slider from "@mui/material/Slider";

import instruments from "audio/instruments";

interface IOtherSettingsProps {
  requireLocal: Function;
  synthIndex: number;
}

export default function OtherSettings({
  requireLocal,
  synthIndex,
}: IOtherSettingsProps) {
  const settings = instruments.myPolySynth.getSynthSettings(synthIndex).others;

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
              instruments.myPolySynth.setSynthSettingsOther(
                "detune",
                newValue,
                synthIndex
              );
              requireLocal();
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
              instruments.myPolySynth.setSynthSettingsOther(
                "volume",
                newValue,
                synthIndex
              );
              requireLocal();
            }}
            valueLabelDisplay="auto"
          />
        </div>
      )}
    </div>
  );
}
