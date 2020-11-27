import React from "react";

import DialogContent from "@material-ui/core/DialogContent";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Slider from "@material-ui/core/Slider";
import * as types from "types";
import { AvailableSynthsEnum } from "types";
import DelaySlider from "../DelaySlider";
import MyMidiPlayer from "audio/midiPlayer";

import EnvelopeSettings from "./EnvelopeSettings";
import OscillatorSettings from "./OscillatorSettings";
import OtherSettings from "../OtherSettings";

export interface ISynthTab {
  midiPlayer: MyMidiPlayer;
  forceRerender: types.forceRerender;
  forceLocalRender: types.forceLocalRender;
}

export default function SynthTab({
  midiPlayer,
  forceRerender,
  forceLocalRender,
}: ISynthTab) {
  function handleOnChangeSynthName(e: any) {
    midiPlayer.myTonejs?.setSynthName(e.target.value);
    setTimeout(forceLocalRender, 500);
  }

  const availableValues = Object.keys(AvailableSynthsEnum);

  return (
    <div>
      <DialogContent>
        <InputLabel>Synthesizer</InputLabel>
        <Select
          value={midiPlayer.myTonejs?.getSynthName()}
          onChange={handleOnChangeSynthName}
        >
          {availableValues.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
        <EnvelopeSettings
          midiPlayer={midiPlayer}
          forceLocalRender={forceLocalRender}
        />
        <OscillatorSettings
          midiPlayer={midiPlayer}
          forceLocalRender={forceLocalRender}
        />
        <DelaySlider
          midiPlayer={midiPlayer}
          forceLocalRender={forceLocalRender}
        />
        <OtherSettings
          midiPlayer={midiPlayer}
          forceLocalRender={forceLocalRender}
        />
      </DialogContent>
    </div>
  );
}
