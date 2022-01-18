import React from "react";

import DialogContent from "@mui/material/DialogContent";
import * as types from "types";
// import DelaySlider from "./DelaySlider";

interface ISamplerTabProps {
  forceLocalRender: types.forceLocalRender;
}

export default function SamplerTab({
  forceLocalRender,
}: ISamplerTabProps) {
  // sampler only has 1 track so synthIndex must be 0
  return (
    <DialogContent>
      
      {/* <DelaySlider forceLocalRender={forceLocalRender} synthIndex={0}/> */}
    </DialogContent>
  );
}

