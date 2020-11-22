import React from "react";

import DialogContent from "@material-ui/core/DialogContent";
import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Slider from "@material-ui/core/Slider";
import * as types from "types";
import { AvailableSynthsEnum } from "types";
import prettyMilliseconds from "pretty-ms";
import DelaySlider from "./DelaySlider";
import MyMidiPlayer from "audio/midiPlayer";

export interface ISynthTab {
  midiPlayer: MyMidiPlayer;
  forceRerender: types.forceRerender;
  forceLocalRender: types.forceLocalRender;
}

export default function SynthTab({
  midiPlayer,
  forceRerender,
  forceLocalRender,
}: ISynthTab) {
  function handleOnChangeSynthName(e: any) {
    midiPlayer.myTonejs?.setSynthName(e.target.value);
    // forceRerender();
  }

  function handleOnChangeSynthSettings(value: any, field: string) {
    const synthSettings = midiPlayer.myTonejs?.getSynthSettings();
    if (synthSettings) {
      // this is wrong
      let newSynthSettings: types.ISynthSettings = {
        ...synthSettings,
      };
      if (field === "oscillator") {
        newSynthSettings.oscillator = { type: value };
      } else if (field === "detune") {
        newSynthSettings.detune = value;
      } else {
        // else treat as envelope
        // @ts-ignore
        newSynthSettings.envelope[field] = value;
      }
      midiPlayer.myTonejs?.setSynthSettings(newSynthSettings);
      forceLocalRender(true);
      // forceRerender();
    }
  }

  const availableValues = Object.keys(AvailableSynthsEnum);
  const availableOscillators = Object.keys(types.OscillatorType);
  const synthSettings = midiPlayer.myTonejs?.getSynthSettings();

  return (
    <div>
      <DialogContent>
        <InputLabel>Instrument</InputLabel>
        <Select
          value={midiPlayer.myTonejs?.getSynthName()}
          onChange={handleOnChangeSynthName}
        >
          {availableValues.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
        <InputLabel>Oscillator</InputLabel>
        <Select
          value={synthSettings?.oscillator.type}
          onChange={(e: any) =>
            handleOnChangeSynthSettings(e.target.value, "oscillator")
          }
        >
          {availableOscillators.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
        {synthSettings &&
          Object.entries(synthSettings.envelope).map(([key, value]) => (
            <div key={key}>
              <Typography gutterBottom>{key}</Typography>
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
                onChange={(e, newValue) =>
                  handleOnChangeSynthSettings(newValue, key)
                }
                valueLabelDisplay="auto"
              />
            </div>
          ))}
        <DelaySlider
          midiPlayer={midiPlayer}
          forceLocalRender={forceLocalRender}
        />
        <InputLabel>Detune</InputLabel>
        <Slider
          value={synthSettings?.detune}
          min={-1500}
          step={1}
          max={1500}
          onChange={(e, newValue) =>
            handleOnChangeSynthSettings(newValue, "detune")
          }
          valueLabelDisplay="auto"
        />
      </DialogContent>
    </div>
  );
}
