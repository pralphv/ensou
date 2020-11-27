import React from "react";

import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Slider from "@material-ui/core/Slider";
import MenuItem from "@material-ui/core/MenuItem";

import MyMidiPlayer from "audio/midiPlayer";
import * as types from "types";

interface IOscillatorSettingsProps {
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
}

export default function OscillatorSettings({
  midiPlayer,
  forceLocalRender,
}: IOscillatorSettingsProps) {
  const settings = midiPlayer.myTonejs?.getSynthSettings()?.oscillator;
  const count = settings?.count;
  const spread = settings?.spread;

  return (
    <div>
      {settings && (
        <div>
          <InputLabel>Oscillator</InputLabel>
          <Select
            //@ts-ignore
            value={settings.type}
            onChange={(e: any) => {
              midiPlayer.myTonejs?.setSynthSettingsOscillator(
                "type",
                e.target.value
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
                max={5}
                onChange={(e, newValue) => {
                  midiPlayer.myTonejs?.setSynthSettingsOscillator(
                    "count",
                    newValue as number
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
                  midiPlayer.myTonejs?.setSynthSettingsOscillator(
                    "spread",
                    newValue as number
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
