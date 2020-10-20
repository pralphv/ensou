import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import { storageRef } from "firebaseApi/firebase";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { SamplerOptions } from "tone";
import SynthTab from "./SynthTab";
import EffectsTab from "./EffectsTab";

interface ISamplesDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
  sampleApi: types.IMidiFunctions["sampleApi"];
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  isSampler: boolean;
  audioSettingsApi: types.IMidiFunctions["audioSettingsApi"];
}

export default function AudioSettingsDialog({
  open,
  setOpen,
  sampleApi,
  forceRerender,
  samplerSourceApi,
  isSampler,
  audioSettingsApi
}: ISamplesDialog) {
  console.log("RERENDERED SAMPLE DIALOG");
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Paper square>
        <Tabs
          value={value}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
        >
          <Tab label={isSampler ? "Sampler" : "Synth"} />
          <Tab label="Effects" />
        </Tabs>
        {value === 0 && (
          <SynthTab
            setOpen={setOpen}
            sampleApi={sampleApi}
            forceRerender={forceRerender}
            samplerSourceApi={samplerSourceApi}
            audioSettingsApi={audioSettingsApi}
          />
        )}
        {value === 1 && (
          <EffectsTab
            setOpen={setOpen}
            sampleApi={sampleApi}
            forceRerender={forceRerender}
            samplerSourceApi={samplerSourceApi}
          />
        )}
      </Paper>
    </Dialog>
  );
}
