import React from "react";

import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import MyMidiPlayer from "audio/midiPlayer";
import * as types from "types";

interface ISynthesizerSettingsProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
  synthIndex: number;
}

export default function SynthesizerSettings({
  midiPlayer,
  forceLocalRender,
  synthIndex,
}: ISynthesizerSettingsProps) {
  return (
    <div>
      <InputLabel>Synthesizer</InputLabel>
      <Select
        value={midiPlayer.myTonejs?.getSynthName(synthIndex)}
        onChange={(e: any) => {
          midiPlayer.myTonejs?.setSynthName(e.target.value, synthIndex);
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
