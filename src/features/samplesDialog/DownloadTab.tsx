import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { storageRef } from "firebaseApi/firebase";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import myMidiPlayer from "audio";

interface IDownloadTabProps {
  setOpen: (bool: boolean) => void;
}

export default function DownloadTab({ setOpen }: IDownloadTabProps) {
  console.log("RERENDERED DOWNLOAD TAB");
  const [samples, setSamples] = useState<string[]>([]);
  const [downloadedSamples, setDownloadedSamples] = useState<Set<string>>(
    new Set()
  );
  const [chosenSample, setChosenSample] = useState<string>("");
  useEffect(() => {
    async function getSampleNames() {
      const instrument = "piano"; // kalimba later
      const items = await storageRef
        .child(`samples/${instrument}/124k`)
        .listAll();
      const samples_ = items.prefixes.map((item) => item.name);
      setSamples(samples_);
    }

    async function getDownloadedSamples() {
      let downloadedSamples =
        await indexedDbUtils.getDownloadedServerSamplers();
      downloadedSamples = downloadedSamples.map(
        (sample: string) => sample.split("_")[1]
      );
      setDownloadedSamples(new Set(downloadedSamples));
    }

    getSampleNames();
    getDownloadedSamples();
  }, []);

  function handleChange(event: SelectChangeEvent<string>) {
    setChosenSample(event.target.value);
  }

  function handleOnSubmit() {
    myMidiPlayer.setSampleName(chosenSample);
    myMidiPlayer.setSamplerSource(types.SamplerSourceEnum.server);
    localStorageUtils.setSampleName(chosenSample);
    setOpen(false);
  }
  // http://ivyaudio.com/Piano-in-162
  return (
    <div>
      <DialogContent>
        <DialogContentText>
          Expected file size is around 10MB.
        </DialogContentText>
        <form noValidate style={{ width: "fit-content" }}>
          <FormControl sx={{ minWidth: "150px" }}>
            <InputLabel>Piano Samples</InputLabel>
            <Select value={chosenSample} onChange={handleChange} autoFocus>
              {samples.map((sample) => (
                <MenuItem key={sample} value={sample}>
                  {sample} {downloadedSamples.has(sample) ? "(downloaded)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleOnSubmit}
          color="primary"
          autoFocus
          variant="contained"
        >
          Download
        </Button>
      </DialogActions>
    </div>
  );
}
