import React from "react";

import Dialog from "@material-ui/core/Dialog";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import { ISamplesDialog } from "./types";
import DownloadTab from "./DownloadTab";
import LocalSamplesTab from "./LocalSamplesTab";

export default function SamplesDialog({
  open,
  setOpen,
  sampleApi,
  forceRerender,
  samplerSourceApi,
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
          <Tab label="Local Samples" />
          <Tab label="Download Samples" />
        </Tabs>
        {value === 0 && (
          <LocalSamplesTab
            setOpen={setOpen}
            open={open}
            sampleApi={sampleApi}
            forceRerender={forceRerender}
            samplerSourceApi={samplerSourceApi}
          />
        )}
        {value === 1 && (
          <DownloadTab
            open={open}
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
