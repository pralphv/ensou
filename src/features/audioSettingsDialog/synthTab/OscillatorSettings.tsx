import React from "react";

import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Slider from "@material-ui/core/Slider";
import MenuItem from "@material-ui/core/MenuItem";

import myMidiPlayer from "audio";
import * as types from "types";

interface IOscillatorSettingsProps {
  forceLocalRender: types.forceLocalRender;
  synthIndex: number;
}

export default function OscillatorSettings({
  forceLocalRender,
  synthIndex,
}: IOscillatorSettingsProps) {
  const settings = myMidiPlayer.myTonejs?.getSynthSettings(synthIndex)
    ?.oscillator;
  const count = settings?.count;
  const spread = settings?.spread;
  const harmonicity = settings?.harmonicity;

  return (
    <div>
      {settings && (
        <div>
          <InputLabel>Oscillator</InputLabel>
          <Select
            //@ts-ignore
            value={settings.type}
            onChange={(e: any) => {
              myMidiPlayer.myTonejs?.setSynthSettingsOscillator(
                "type",
                e.target.value,
                synthIndex
              );
              forceLocalRender();
            }}
          >
            {Object.keys(types.OscillatorType).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
          {count && (
            <div>
              <InputLabel>Count</InputLabel>
              <Slider
                value={count}
                min={1}
                step={1}
                max={7}
                onChange={(e, newValue) => {
                  myMidiPlayer.myTonejs?.setSynthSettingsOscillator(
                    "count",
                    newValue as number,
                    synthIndex
                  );
                  forceLocalRender();
                }}
                valueLabelDisplay="auto"
              />
            </div>
          )}
          {spread && (
            <div>
              <InputLabel>Spread</InputLabel>
              <Slider
                value={spread}
                min={1}
                step={1}
                max={100}
                onChange={(e, newValue) => {
                  myMidiPlayer.myTonejs?.setSynthSettingsOscillator(
                    "spread",
                    newValue as number,
                    synthIndex
                  );
                  forceLocalRender();
                }}
                valueLabelDisplay="auto"
              />
            </div>
          )}
          {harmonicity && (
            <div>
              <InputLabel>Harmonicity</InputLabel>
              <Slider
                value={settings.harmonicity}
                min={0.1}
                step={0.1}
                max={5}
                onChange={(e, newValue) => {
                  myMidiPlayer.myTonejs?.setSynthSettingsOscillator(
                    "harmonicity",
                    newValue as number,
                    synthIndex
                  );
                  forceLocalRender();
                }}
                valueLabelDisplay="auto"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
