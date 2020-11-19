import React from "react";

import Dialog from "@material-ui/core/Dialog";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import * as types from "types";
import SynthTab from "./SynthTab";
import SamplerTab from "./SamplerTab";
import EffectsTab from "./effectsTab/EffectsTab";
import MyMidiPlayer from "audio/midiPlayer";

interface ISamplesDialog {
  midiPlayer: MyMidiPlayer;
  open: boolean;
  setOpen: (bool: boolean) => void;
  forceRerender: types.forceRerender;
  isSampler: boolean;
  forceLocalRender: () => void;
}

export default function AudioSettingsDialog({
  midiPlayer,
  open,
  setOpen,
  forceRerender,
  isSampler,
  forceLocalRender,
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
      {value === 0 &&
        (isSampler ? (
          <SamplerTab
            midiPlayer={midiPlayer}
            forceLocalRender={forceLocalRender}
          />
        ) : (
          <SynthTab
            midiPlayer={midiPlayer}
            forceRerender={forceRerender}
            forceLocalRender={forceLocalRender}
          />
        ))}
      {value === 1 && (
        <EffectsTab
          forceRerender={forceRerender}
          midiPlayer={midiPlayer}
          forceLocalRender={forceLocalRender}
        />
      )}
    </Dialog>
  );
}
