import React from "react";

import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import myMidiPlayer from "audio";
import * as types from "types";

interface ISynthesizerSettingsProps {
  forceLocalRender: types.forceLocalRender;
  synthIndex: number;
}

export default function SynthesizerSettings({
  forceLocalRender,
  synthIndex,
}: ISynthesizerSettingsProps) {
  return (
    <div>
      <InputLabel>Synthesizer</InputLabel>
      <Select
        value={myMidiPlayer.myTonejs?.getSynthName(synthIndex)}
        onChange={(e: any) => {
          myMidiPlayer.myTonejs?.setSynthName(e.target.value, synthIndex);
          setTimeout(forceLocalRender, 500);
        }}
      >
        {Object.keys(types.AvailableSynthsEnum).map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
