import React, { useState } from "react";

import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { Typography } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useDropzone } from "react-dropzone";

import * as types from "types";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { SamplerOptions } from "tone";
import { convertArrayBufferToAudioContext } from "utils/helper";
import myMidiPlayer from "audio";

interface ILocalSamplesTabProps {
  setOpen: (bool: boolean) => void;
}

function checkValidMusicNote(note: string) {
  if (note.length >= 4) {
    return false;
  }
  if (note.includes("#") || note.includes("b")) {
    if (!/^([A-G]{1})(|b{1})([0-9]{1})$/.test(note)) {
      return false;
    }
  } else {
    if (!/^([A-G]{1})([0-9]{1})$/.test(note)) {
      return false;
    }
  }
  return true;
}

export default function LocalSamplesTab({ setOpen }: ILocalSamplesTabProps) {
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
      const sampleMap: SamplerOptions["urls"] =
        await convertArrayBufferToAudioContext(arrayBufferMap);
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
      myMidiPlayer.setLocalSampler(sampleMap);
      myMidiPlayer.setSamplerSource(types.SamplerSourceEnum.local);
      setOpen(false);
    }
  }

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
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

        {/* <section className="container" style={{ marginLeft: 8 * 3 }}> */}
        <section className="file-contaiener" >
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
