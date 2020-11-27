import React from "react";

import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import prettyMilliseconds from "pretty-ms";
import Slider from "@material-ui/core/Slider";

import MyMidiPlayer from "audio/midiPlayer";
import * as types from "types";

interface IEnvelopeSettingsProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
}

export default function EnvelopeSettings({
  midiPlayer,
  forceLocalRender,
}: IEnvelopeSettingsProps) {
  const settings = midiPlayer.myTonejs?.getSynthSettings()?.envelope;

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
                midiPlayer.myTonejs?.setSynthSettingsEnvelope(key, newValue);
                forceLocalRender();
              }}
              valueLabelDisplay="auto"
            />
          </div>
        ))}
    </div>
  );
}
