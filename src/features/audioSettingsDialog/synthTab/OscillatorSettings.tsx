import React from "react";

import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import MenuItem from "@mui/material/MenuItem";

import instruments from "audio/instruments";
import * as types from "types";

interface IOscillatorSettingsProps {
  requireRender: Function;
  synthIndex: number;
}

export default function OscillatorSettings({
  requireRender,
  synthIndex,
}: IOscillatorSettingsProps) {
  const settings =
  instruments.myPolySynth.getSynthSettings(synthIndex)?.oscillator;
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
              instruments.myPolySynth.setSynthSettingsOscillator(
                "type",
                e.target.value,
                synthIndex
              );
              requireRender();
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
                size="small"
                value={count}
                min={1}
                step={1}
                max={7}
                onChange={(e, newValue) => {
                  instruments.myPolySynth.setSynthSettingsOscillator(
                    "count",
                    newValue as number,
                    synthIndex
                  );
                  requireRender();
                }}
                valueLabelDisplay="auto"
              />
            </div>
          )}
          {spread && (
            <div>
              <InputLabel>Spread</InputLabel>
              <Slider
                size="small"
                value={spread}
                min={1}
                step={1}
                max={100}
                onChange={(e, newValue) => {
                  instruments.myPolySynth.setSynthSettingsOscillator(
                    "spread",
                    newValue as number,
                    synthIndex
                  );
                  requireRender();
                }}
                valueLabelDisplay="auto"
              />
            </div>
          )}
          {harmonicity && (
            <div>
              <InputLabel>Harmonicity</InputLabel>
              <Slider
                size="small"
                value={settings.harmonicity}
                min={0.1}
                step={0.1}
                max={5}
                onChange={(e, newValue) => {
                  instruments.myPolySynth.setSynthSettingsOscillator(
                    "harmonicity",
                    newValue as number,
                    synthIndex
                  );
                  requireRender();
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
