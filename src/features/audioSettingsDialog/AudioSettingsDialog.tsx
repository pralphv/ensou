import React from "react";

import Dialog from "@material-ui/core/Dialog";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import * as types from "types";
import SynthTab from "./SynthTab";
import EffectsTab from "./effectsTab/EffectsTab";

interface ISamplesDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
  sampleApi: types.IMidiFunctions["sampleApi"];
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  isSampler: boolean;
  synthSettingsApi: types.IMidiFunctions["synthSettingsApi"];
  forceLocalRender: () => void;
  trackFxApi: types.IMidiFunctions["trackFxApi"];
}

export default function AudioSettingsDialog({
  open,
  setOpen,
  sampleApi,
  forceRerender,
  samplerSourceApi,
  isSampler,
  synthSettingsApi,
  forceLocalRender,
  trackFxApi,
}: ISamplesDialog) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Dialog maxWidth="lg" open={open} onClose={() => setOpen(false)}>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
      >
        <Tab label={isSampler ? "Sampler" : "Synth"} />
        <Tab label="Effects" />
      </Tabs>
      {value === 0 && ( !isSampler &&
        <SynthTab
          sampleApi={sampleApi}
          forceRerender={forceRerender}
          synthSettingsApi={synthSettingsApi}
          forceLocalRender={forceLocalRender}
        />
      )}
      {value === 1 && (
        <EffectsTab
          forceRerender={forceRerender}
          trackFxApi={trackFxApi}
          forceLocalRender={forceLocalRender}
        />
      )}
    </Dialog>
  );
}
