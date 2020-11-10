import React from "react";

import DialogContent from "@material-ui/core/DialogContent";
import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Slider from "@material-ui/core/Slider";
import * as types from "types";
import * as localTypes from "./types";
import { AvailableSynthsEnum } from "types";
import prettyMilliseconds from "pretty-ms";

export default function SynthTab({
  forceRerender,
  synthSettingsApi,
  forceLocalRender,
}: localTypes.ISynthTab) {
  function handleOnChangeSynthName(e: any) {
    synthSettingsApi.setSynthName(e.target.value);
    // forceRerender();
  }

  function handleOnChangeSynthSettings(value: any, field: string) {
    if (synthSettings) {
      // this is wrong
      let newSynthSettings: types.ISynthSettings = {
        ...synthSettings,
      };
      if (field === "oscillator") {
        newSynthSettings.oscillator = { type: value };
      } else {
        // else treat as envelope
        // @ts-ignore
        newSynthSettings.envelope[field] = value;
      }
      synthSettingsApi.setSynthSettings(newSynthSettings);
      forceLocalRender();
      // forceRerender();
    }
  }

  const availableValues = Object.keys(AvailableSynthsEnum);
  const availableOscillators = Object.keys(types.OscillatorType);
  const synthSettings = synthSettingsApi.getSynthSettings();

  return (
    <div>
      <DialogContent>
        <InputLabel>Instrument</InputLabel>
        <Select
          value={synthSettingsApi.getSynthName()}
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
          value={synthSettingsApi?.getSynthSettings()?.oscillator.type}
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
      </DialogContent>
    </div>
  );
}
