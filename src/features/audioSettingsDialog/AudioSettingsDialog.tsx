import React from "react";

import Dialog from "@mui/material/Dialog";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import SynthTab from "./synthTab/SynthTab";
import SamplerTab from "./SamplerTab";
import EffectsTab from "./effectsTab/EffectsTab";
import myMidiPlayer from "audio";

interface IAudioSettingsDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
  forceLocalRender: () => void;
}

export default function AudioSettingsDialog({
  open,
  setOpen,
  forceLocalRender,
}: IAudioSettingsDialog) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const isSampler = myMidiPlayer.checkIfSampler();
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
          <SamplerTab forceLocalRender={forceLocalRender} />
        ) : (
          <SynthTab forceLocalRender={forceLocalRender} />
        ))}
      {value === 1 && <EffectsTab forceLocalRender={forceLocalRender} />}
    </Dialog>
  );
}
