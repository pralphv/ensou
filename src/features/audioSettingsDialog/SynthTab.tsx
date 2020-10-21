import React, { useEffect, useState } from "react";

import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Slider from "@material-ui/core/Slider";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { SamplerOptions } from "tone";
import * as localTypes from "./types";
import { AvailableSynthsEnum } from "types";
import prettyMilliseconds from "pretty-ms";

export default function SynthTab({
  setOpen,
  samplerSourceApi,
  forceRerender,
  audioSettingsApi,
  forceLocalRender,
}: localTypes.ISynthTab) {
  function handleOnChangeSynthName(e: any) {
    audioSettingsApi.setSynthName(e.target.value);
    forceRerender();
  }

  function handleOnChangeAudioSettings(value: any, field: string) {
    if (audioSettings) {
      // this is wrong
      let newAudioSettings: types.IAudioSettings = {
        ...audioSettings,
      };
      if (field === "oscillator") {
        newAudioSettings.oscillator = { type: value };
      } else {
        // else treat as envelope
        // @ts-ignore
        newAudioSettings.envelope[field] = value;
      }
      audioSettingsApi.setAudioSettings(newAudioSettings);
      forceLocalRender();
      // forceRerender();
    }
  }

  const availableValues = Object.keys(AvailableSynthsEnum);
  const availableOscillators = Object.keys(types.OscillatorType);
  const audioSettings = audioSettingsApi.getAudioSettings();

  return (
    <div>
      <DialogContent>
        <InputLabel>Instrument</InputLabel>
        <Select
          value={audioSettingsApi.getSynthName()}
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
          value={audioSettingsApi?.getAudioSettings()?.oscillator.type}
          onChange={(e: any) =>
            handleOnChangeAudioSettings(e.target.value, "oscillator")
          }
        >
          {availableOscillators.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
        {audioSettings &&
          Object.entries(audioSettings.envelope).map(([key, value]) => (
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
                  handleOnChangeAudioSettings(newValue, key)
                }
                valueLabelDisplay="auto"
              />
            </div>
          ))}
      </DialogContent>
    </div>
  );
}
