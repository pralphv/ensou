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
  // sampler only has 1 track so synthIndex must be 0
  return (
    <DialogContent>
      <DelaySlider midiPlayer={midiPlayer} forceLocalRender={forceLocalRender} synthIndex={0}/>
    </DialogContent>
  );
}

