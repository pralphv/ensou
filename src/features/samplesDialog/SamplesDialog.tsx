import React from "react";

import Dialog from "@material-ui/core/Dialog";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import DownloadTab from "./DownloadTab";
import LocalSamplesTab from "./LocalSamplesTab";

interface ISamplesDialogProps {
  open: boolean;
  setOpen: (bool: boolean) => void;
}

export default function SamplesDialog({ open, setOpen }: ISamplesDialogProps) {
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
          <Tab label="Record Sample" />
        </Tabs>
        {value === 0 && <LocalSamplesTab setOpen={setOpen} />}
        {value === 1 && <DownloadTab setOpen={setOpen} />}
        {value === 2 && <DownloadTab setOpen={setOpen} />}
      </Paper>
    </Dialog>
  );
}
