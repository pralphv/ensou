import React, { useState } from "react";

import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "app/rootReducer";

import { useDropzone } from "react-dropzone";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useFirestore } from "react-redux-firebase";

import { storageRef } from "firebaseApi/firebase";
import { Pages } from "layouts/constants";

interface IMidiUploadDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ITextField {
  id: string;
  label: string;
}

function createTextField(id: string, label: string): ITextField {
  return { id, label };
}

const UPLOAD_FILE_FORM: ITextField[] = [
  createTextField("filename", "Filename"),
  createTextField("artist", "Artist"),
  createTextField("instrument", "Instrument"),
  createTextField("transcribedBy", "Transcribed by"),
];

interface IFormData {
  filename: string;
  artist: string;
  instrument: string;
  transcribedBy: string;
}

export default function MidiUploadDialog({
  open,
  setOpen,
}: IMidiUploadDialogProps): JSX.Element {
  console.log("MidiUploadDialog rendered");
  function handleOnDropAccepted(e: any) {
    let filename = e[0].path;
    filename = filename.slice(0, filename.length - 4);
    setFormData({ ...formData, filename });
  }

  function handleOnDropRejected(e: any) {
    const errorMsg: string = e[0].errors[0].message;
    enqueueSnackbar(errorMsg, { variant: "error" });
  }

  async function handleOnChange(e: any) {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  }

  async function handleOnSubmit() {
    if (acceptedFiles.length === 0) {
      return;
    }

    for (let value of Object.values(formData)) {
      if (value === "") {
        return;
      }
    }
    try {
      const resp = await firestore.collection("midi").add({
        ...formData,
        date: new Date(),
        uploader: username,
      });
      await storageRef.child(`midi/${resp.id}.mid`).put(acceptedFiles[0]);
      enqueueSnackbar("Upload successful", { variant: "success" });
      history.push(`${Pages.Player}/${resp.id}`);
    } catch (e) {
      console.error({ e });
      if (e instanceof Error) {
        enqueueSnackbar(e.message, { variant: "error" });
      }
    }
    setOpen(false);
  }
  const firestore = useFirestore();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const username = useSelector(
    (state: RootState) => state.firebase.auth.displayName
  );

  const [formData, setFormData] = useState<IFormData>({
    filename: "",
    artist: "",
    instrument: "",
    transcribedBy: "",
  });

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      maxSize: 1 * 1000 * 1000,
      onDropAccepted: handleOnDropAccepted,
      onDropRejected: handleOnDropRejected,
      multiple: false,
      accept: "audio/mid",
    });

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Upload Midi</DialogTitle>
      <section className="container" style={{ marginLeft: 8 * 3 }}>
        <input {...getInputProps()} />
        <div {...getRootProps({ className: "dropzone" })}>
          {acceptedFiles.length > 0 ? (
            <Typography>{acceptedFiles[0].name}</Typography>
          ) : isDragActive ? (
            <Typography>Drag here</Typography>
          ) : (
            <Typography>Click or Drag and Drop</Typography>
          )}
        </div>
      </section>
      <DialogContent>
        {UPLOAD_FILE_FORM.map((obj) => (
          <TextField
            key={obj.id}
            margin="dense"
            id={obj.id}
            label={obj.label}
            fullWidth
            required={true}
            onChange={handleOnChange}
            value={formData[obj.id as keyof IFormData]}
            autoComplete={"off"}
            variant="standard"
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOnSubmit} color="primary" variant="contained">
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
