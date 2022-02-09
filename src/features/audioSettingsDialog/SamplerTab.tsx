import React from "react";

import DialogContent from "@mui/material/DialogContent";
// import DelaySlider from "./DelaySlider";

interface ISamplerTabProps {
  requireRender: Function;
}

export default function SamplerTab({
  requireRender,
}: ISamplerTabProps) {
  // sampler only has 1 track so synthIndex must be 0
  return (
    <DialogContent>
    </DialogContent>
  );
}

