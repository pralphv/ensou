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
  onClose: () => void;
  requireRender: Function;
}

export default function AudioSettingsDialog({
  open,
  requireRender,
  onClose
}: IAudioSettingsDialog) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const isSampler = myMidiPlayer.checkIfSampler();
  return (
    <Dialog maxWidth="lg" open={open} onClose={onClose}>
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
          <SamplerTab requireRender={requireRender} />
        ) : (
          <SynthTab requireRender={requireRender} />
        ))}
      {value === 1 && <EffectsTab requireRender={requireRender} />}
    </Dialog>
  );
}
