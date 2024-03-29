import React from "react";

import { Typography } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import prettyMilliseconds from "pretty-ms";
import Slider from "@mui/material/Slider";

import instruments from "audio/instruments";
import * as types from "types";

interface IEnvelopeSettingsProps {
  requireRender: Function;
  synthIndex: number;
}

export default function EnvelopeSettings({
  requireRender,
  synthIndex,
}: IEnvelopeSettingsProps) {
  const settings =
    instruments.myPolySynth.getSynthSettings(synthIndex)?.envelope;

  return (
    <div>
      <Typography>Envelope</Typography>
      {settings &&
        Object.entries(settings).map(([key, value]: [any, number]) => (
          <div key={key}>
            <InputLabel>{key}</InputLabel>
            <Slider
              size="small"
              value={value as number}
              min={0.00001}
              step={0.001}
              max={1}
              valueLabelFormat={(value) => {
                return prettyMilliseconds(value * 1000, {
                  formatSubMilliseconds: true,
                });
              }}
              onChange={(e, newValue) => {
                instruments.myPolySynth.setSynthSettingsEnvelope(
                  key,
                  newValue,
                  synthIndex
                );
                requireRender();
              }}
              valueLabelDisplay="auto"
            />
          </div>
        ))}
    </div>
  );
}
