import React from "react";

import Dialog from "@material-ui/core/Dialog";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import DownloadTab from "./DownloadTab";
import LocalSamplesTab from "./LocalSamplesTab";
import * as types from "types";
import MyMidiPlayer from "audio/midiPlayer";

interface ISamplesDialogProps {
  open: boolean;
  setOpen: (bool: boolean) => void;
  forceRerender: types.forceRerender;
  midiPlayer: MyMidiPlayer;
}

export default function SamplesDialog({
  open,
  setOpen,
  midiPlayer,
  forceRerender,
}: ISamplesDialogProps) {
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
          <Tab label="Local Samples" />
          <Tab label="Download Samples" />
        </Tabs>
        {value === 0 && (
          <LocalSamplesTab
            setOpen={setOpen}
            open={open}
            midiPlayer={midiPlayer}
            forceRerender={forceRerender}
          />
        )}
        {value === 1 && (
          <DownloadTab
            open={open}
            setOpen={setOpen}
            midiPlayer={midiPlayer}
            forceRerender={forceRerender}
          />
        )}
      </Paper>
    </Dialog>
  );
}
