import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import { storageRef } from "firebaseApi/firebase";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import MyMidiPlayer from "audio/midiPlayer";

interface IDownloadTabProps {
  open: boolean;
  setOpen: (bool: boolean) => void;
  forceRerender: types.forceRerender;
  midiPlayer: MyMidiPlayer;
}

export default function DownloadTab({
  setOpen,
  midiPlayer,
  forceRerender,
}: IDownloadTabProps) {
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
      let downloadedSamples = await indexedDbUtils.getDownloadedServerSamplers();
      downloadedSamples = downloadedSamples.map(
        (sample: string) => sample.split("_")[1]
      );
      setDownloadedSamples(new Set(downloadedSamples));
    }

    getSampleNames();
    getDownloadedSamples();
  }, []);

  function handleChange(event: React.ChangeEvent<{ value: unknown }>) {
    setChosenSample(event.target.value as string);
  }

  function handleOnSubmit() {
    midiPlayer.setSampleName(chosenSample);
    midiPlayer.setSamplerSource(types.SamplerSourceEnum.server);
    localStorageUtils.setSampleName(chosenSample);
    setOpen(false);
    forceRerender(); // to start downloading
  }
  // http://ivyaudio.com/Piano-in-162
  return (
    <div>
      <DialogContent>
        <DialogContentText>
          Expected file size is around 10MB.
        </DialogContentText>
        <DialogContentText>
          Using samples may affect performance.
        </DialogContentText>
        <form noValidate style={{ width: "fit-content" }}>
          <FormControl style={{ minWidth: "120px" }}>
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
