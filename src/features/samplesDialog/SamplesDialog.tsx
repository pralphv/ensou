import React from "react";

import Dialog from "@mui/material/Dialog";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DownloadTab from "./DownloadTab";
import RecordSampleTab from "./RecordSampleTab";
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
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
      >
        <Tab label="Local" />
        <Tab label="Download" />
        <Tab label="Record" />
      </Tabs>
      {value === 0 && <LocalSamplesTab setOpen={setOpen} />}
      {value === 1 && <DownloadTab setOpen={setOpen} />}
      {value === 2 && (
        <RecordSampleTab
          onCancel={() => setOpen(false)}
          onOk={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
}
