import React from "react";

import DialogContent from "@material-ui/core/DialogContent";
import * as types from "types";
import DelaySlider from "./DelaySlider";
import MyMidiPlayer from "audio/midiPlayer";

interface ISamplerTabProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
}

export default function SamplerTab({
  midiPlayer,
  forceLocalRender,
}: ISamplerTabProps) {
  return (
    <DialogContent>
      <DelaySlider midiPlayer={midiPlayer} forceLocalRender={forceLocalRender} />
    </DialogContent>
  );
}

