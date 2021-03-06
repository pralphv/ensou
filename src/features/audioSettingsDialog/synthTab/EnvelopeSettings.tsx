import React from "react";

import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import prettyMilliseconds from "pretty-ms";
import Slider from "@material-ui/core/Slider";

import myMidiPlayer from "audio";
import * as types from "types";

interface IEnvelopeSettingsProps {
  forceLocalRender: types.forceLocalRender;
  synthIndex: number;
}

export default function EnvelopeSettings({
  forceLocalRender,
  synthIndex,
}: IEnvelopeSettingsProps) {
  const settings = myMidiPlayer.myTonejs?.getSynthSettings(synthIndex)
    ?.envelope;

  return (
    <div>
      <Typography>Envelope</Typography>
      {settings &&
        Object.entries(settings).map(([key, value]: [any, number]) => (
          <div key={key}>
            <InputLabel>{key}</InputLabel>
            <Slider
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
                myMidiPlayer.myTonejs?.setSynthSettingsEnvelope(
                  key,
                  newValue,
                  synthIndex
                );
                forceLocalRender();
              }}
              valueLabelDisplay="auto"
            />
          </div>
        ))}
    </div>
  );
}
