import React, { useEffect, useState } from "react";

import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { SamplerOptions } from "tone";
import * as localTypes from "./types";
import { AvailableSynthsEnum } from "types";

export default function SynthTab({
  setOpen,
  samplerSourceApi,
  forceRerender,
  audioSettingsApi,
}: localTypes.ISynthTab) {
  function handleOnChangeOscillator(e: any) {
    console.log(e.target.value)
    audioSettingsApi.setOscillator(e.target.value);
    forceRerender();
  }
  console.log("RERENDERED")
  const availableValues = Object.keys(AvailableSynthsEnum);
  return (
    <div>
      <DialogContent>
        <DialogContentText>
          <form noValidate style={{ width: "fit-content" }}>
            <FormControl style={{ minWidth: "120px" }}>
              <InputLabel>Piano Samples</InputLabel>
              <Select
                autoFocus
                value={audioSettingsApi.getOscillator()}
                onChange={handleOnChangeOscillator}
              >
                {availableValues.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        </DialogContentText>
      </DialogContent>
    </div>
  );
}
