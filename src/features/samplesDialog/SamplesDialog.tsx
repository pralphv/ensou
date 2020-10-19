import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { useSnackbar } from "notistack";
import { useDropzone } from "react-dropzone";

import { storageRef } from "firebaseApi/firebase";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { SamplerOptions } from "tone";
import {
  getAudioContext,
  convertArrayBufferToAudioContext,
} from "utils/helper";

interface ISamplesDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
  onClick: () => void;
  sampleApi: types.IMidiFunctions["sampleApi"];
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
}

export default function SamplesDialog({
  open,
  setOpen,
  onClick,
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
            onClick={onClick}
            open={open}
            sampleApi={sampleApi}
            forceRerender={forceRerender}
            samplerSourceApi={samplerSourceApi}
          />
        )}
        {value === 1 && (
          <DownloadTab
            setOpen={setOpen}
            onClick={onClick}
            open={open}
            sampleApi={sampleApi}
            forceRerender={forceRerender}
            samplerSourceApi={samplerSourceApi}
          />
        )}
      </Paper>
    </Dialog>
  );
}

function DownloadTab({
  setOpen,
  sampleApi,
  forceRerender,
  samplerSourceApi,
}: ISamplesDialog) {
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
    sampleApi.setSample(chosenSample);
    samplerSourceApi.setSamplerSource(types.SamplerSourceEnum.server);
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

function checkValidMusicNote(note: string) {
  if (note.length >= 4) {
    return false;
  }
  if (note.includes("#") || note.includes("b")) {
    if (!/^([A-G]{1})(\#|b{1})([0-9]{1})$/.test(note)) {
      return false;
    }
  } else {
    if (!/^([A-G]{1})([0-9]{1})$/.test(note)) {
      return false;
    }
  }
  return true;
}

function LocalSamplesTab({
  setOpen,
  samplerSourceApi,
  forceRerender,
}: ISamplesDialog) {
  const [sampleMap, setSampleMap] = useState<SamplerOptions["urls"]>();
  const { enqueueSnackbar } = useSnackbar();

  async function handleOnDropAccepted(e: any) {
    const arrayBufferMap: types.ArrayBufferMap = {}; // just for saving in indexdb
    for (let i = 0; i < e.length; i++) {
      const file = e[i];
      const note: string = file.name.split(".")[0]; // expect A1 or A#1
      if (!checkValidMusicNote(note)) {
        continue;
      }
      // @ts-ignore
      const arrayBuffer = await file.arrayBuffer();
      arrayBufferMap[note] = arrayBuffer;
    }
    if (Object.keys(arrayBufferMap).length >= 1) {
      await indexedDbUtils.setLocalSamplerArrayBuffer(arrayBufferMap);
      const sampleMap: SamplerOptions["urls"] = await convertArrayBufferToAudioContext(
        arrayBufferMap
      );
      setSampleMap(sampleMap);
      enqueueSnackbar("Successfully loaded samples", { variant: "success" });
    } else {
      enqueueSnackbar("No valid samples were loaded", { variant: "warning" });
    }
  }

  function handleOnDropRejected(e: any) {
    const errorMsg: string = e[0].errors[0].message;
    enqueueSnackbar(errorMsg, { variant: "error" });
  }

  function handleOnSubmit() {
    if (sampleMap) {
      console.log({ sampleMap });
      samplerSourceApi.setLocalSampler(sampleMap);
      samplerSourceApi.setSamplerSource(types.SamplerSourceEnum.local);
      setOpen(false);
      forceRerender();
    }
  }

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDropAccepted: handleOnDropAccepted,
    onDropRejected: handleOnDropRejected,
    multiple: true,
    accept: ".mp3",
  });

  return (
    <div>
      <DialogContent>
        <DialogContentText>
          Name your files according to their notes, etc A1.mp3, A#1.mp3.
        </DialogContentText>
        <DialogContentText>
          Notes that are not provided will be automatically repitched.
        </DialogContentText>
        <DialogContentText>
          Using samples may affect performance.
        </DialogContentText>

        <section className="container" style={{ marginLeft: 8 * 3 }}>
          <input {...getInputProps()} />
          <div {...getRootProps({ className: "dropzone" })}>
            {acceptedFiles.length > 0 ? (
              <Typography>{acceptedFiles[0].name}</Typography>
            ) : isDragActive ? (
              <Typography>Drag here</Typography>
            ) : (
              <Typography>Click to select files or Drag and Drop</Typography>
            )}
          </div>
        </section>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOnSubmit} color="primary" variant="contained">
          OK
        </Button>
      </DialogActions>
    </div>
  );
}
