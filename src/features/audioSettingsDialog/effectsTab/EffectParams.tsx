import React from "react";

import { Typography } from "@material-ui/core";
import Slider from "@material-ui/core/Slider";
import { Gain } from "tone";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import * as types from "types";

interface IRange {
  min: number;
  max: number;
  noteScale?: boolean;
  step: number;
}
interface IEFFECT_PARAMS_MAP {
  [key: string]: string[];
}

const EFFECT_PARAMS_MAP: IEFFECT_PARAMS_MAP = {
  Reverb: ["wet", "decay", "preDelay"],
  FeedbackDelay: ["feedback", "delayTime"],
  Chorus: ["frequency", "delayTime", "depth"],
  Phaser: ["frequency", "octaves", "baseFrequency"],
  Gain: ["value"],
  Filter: ["type", "frequency", "rolloff"],
};

function getNoteRange() {
  return { min: 0.001, max: 6, noteScale: true, step: 0.01 }; //  2 ** 6 is 64
  // this is wrong
}

function getNormalRange() {
  return { min: 0, max: 1, step: 0.01 };
}

function getFrequency() {
  return { min: 0, max: 20000, step: 1 };
}

interface IFIELD_MIN_MAX {
  [key: string]: IRange;
}

const FIELD_MIN_MAX: IFIELD_MIN_MAX = {
  wet: getNormalRange(),
  decay: getNoteRange(),
  preDelay: getNoteRange(),
  feedback: getNormalRange(),
  delayTime: getNormalRange(),
  depth: getNormalRange(),
  frequency: getFrequency(),
  baseFrequency: getFrequency(),
  octaves: { min: 1, max: 10, step: 1 },
  value: { min: 0, max: 5, step: 0.1 }, //  Gain
};

interface IFieldOptions {
  [key: string]: (string | number)[];
}

const SELECT_OPTIONS_MAP: IFieldOptions = {
  type: [
    "allpass",
    "bandpass",
    "highpass",
    "highshelf",
    "lowpass",
    "lowshelf",
    "notch",
    "peaking",
  ],
  rolloff: [-12, -24, -48, -96],
};

function extractNumber(value: any): number {
  const result = typeof value === "object" ? value.value : value;
  return result;
}

interface IEffectParams {
  effectName: types.AvailableEffectsNames;
  fx: types.AvailableEffects;
  changeFxSettings: types.IMidiFunctions["trackFxApi"]["changeFxSettings"];
  trackIndex: number;
  fxIndex: number;
  forceLocalRender: types.forceLocalRender;
}

export default function EffectParams({
  effectName,
  fx,
  changeFxSettings,
  trackIndex,
  fxIndex,
  forceLocalRender,
}: IEffectParams): JSX.Element {
  return (
    <div>
      {effectName && EFFECT_PARAMS_MAP[effectName].map((param, i) => {
        let step = FIELD_MIN_MAX[param]?.step;
        let min = FIELD_MIN_MAX[param]?.min;
        let max = FIELD_MIN_MAX[param]?.max;
        //@ts-ignore
        let value = fx[param];
        if (param === "delayTime" && effectName === "Chorus") {
          min = 2;
          max = 20;
        } else if (param === "value") {
          // Gain
          fx = fx as Gain;
          value = fx.gain;
        }
        return (
          <div key={`${param}_${i}`}>
            <Typography gutterBottom>{param}</Typography>
            {Object.keys(SELECT_OPTIONS_MAP).includes(param) ? (
              <CustomSelect
                value={value}
                onChange={(e) => {
                  changeFxSettings(trackIndex, fxIndex, param, e.target.value);
                  forceLocalRender(true);
                }}
                items={SELECT_OPTIONS_MAP[param]}
              />
            ) : (
              <Slider
                value={extractNumber(value)}
                valueLabelDisplay="auto"
                min={min}
                step={step}
                // scale={(x) =>
                //   FIELD_MIN_MAX[param].noteScale ? 2 ** x : x
                // }
                max={max}
                // valueLabelFormat={(x) =>
                //   FIELD_MIN_MAX[param].noteScale ? `${x}n` : x
                // }
                onChange={(e, newValue) => {
                  changeFxSettings(
                    trackIndex,
                    fxIndex,
                    param,
                    newValue as number
                  );
                  forceLocalRender(true);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ICustomSelectProps {
  value: string;
  onChange: (e: any) => void;
  items: (string | number)[];
}

function CustomSelect({ value, onChange, items }: ICustomSelectProps) {
  return (
    <Select value={value} onChange={onChange}>
      {items.map((value) => (
        <MenuItem key={value} value={value}>
          {value}
        </MenuItem>
      ))}
    </Select>
  );
}
