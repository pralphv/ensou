import React, { useEffect, useState, useRef } from "react";

import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import DialogContentText from "@mui/material/DialogContentText";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import StopIcon from "@mui/icons-material/Stop";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import { Synth } from "tone";

import { PIANO_TUNING } from "audio/constants";
import myMidiPlayer from "audio";

let audioCtx;
const HAS_MEDIA_SUPPORT: boolean = !!navigator.mediaDevices.getUserMedia;

interface IRecordSampleTabProps {
  onCancel: () => void;
  onOk: () => void;
}

export default function RecordSampleTab({
  onCancel,
  onOk,
}: IRecordSampleTabProps): JSX.Element {
  return (
    <React.Fragment>
      {HAS_MEDIA_SUPPORT ? (
        <Supported onOk={onOk} onCancel={onCancel} />
      ) : (
        <NotSupported />
      )}
    </React.Fragment>
  );
}

interface IRecordButton {
  recording: boolean;
  onClick: () => void;
}

function RecordButton({ recording, onClick }: IRecordButton): JSX.Element {
  return (
    <IconButton color="error" aria-label="publish" onClick={onClick}>
      {recording ? <StopIcon /> : <FiberManualRecordIcon />}
    </IconButton>
  );
}

function NotSupported(): JSX.Element {
  return (
    <DialogContent>
      <DialogContentText>
        Your device does not support this feature
      </DialogContentText>
    </DialogContent>
  );
}

class MyMediaRecorder {
  chunks: Blob[];
  mediaRecorder: MediaRecorder;
  blob?: Blob;

  constructor(stream: MediaStream) {
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];
    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      this.chunks.push(e.data);
    };
    this.mediaRecorder.onstop = (e) => {
      // when stopped, it goes to ondataavailable, then onstop
      this.blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
      this.chunks = [];
    };
    this.start = this.start.bind(this);
  }

  start() {
    this.chunks = [];
    this.mediaRecorder.start();
    console.log("Recording started");
  }

  stop() {
    this.mediaRecorder.stop();
    console.log("Recording stopped");
  }
}

function Supported({ onCancel, onOk }: IRecordSampleTabProps): JSX.Element {
  const [accepted, setAccepted] = useState<boolean>();
  const mediaRecorderRef = useRef<MyMediaRecorder | null>(null);

  function onSuccess(stream: MediaStream) {
    setAccepted(true);
    mediaRecorderRef.current = new MyMediaRecorder(stream);
  }

  function onError() {
    setAccepted(false);
  }

  useEffect(() => {
    async function askForPermission() {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(onSuccess, onError);
    }
    askForPermission();
  }, []);

  return accepted ? (
    <Accepted
      onCancel={onCancel}
      onOk={onOk}
      mediaRecorderRef={mediaRecorderRef}
    />
  ) : (
    <Declined />
  );
}

function Declined(): JSX.Element {
  return (
    <DialogContent>
      <DialogContentText>
        You have to grant audio permission for this feature
      </DialogContentText>
    </DialogContent>
  );
}

interface IAcceptedProps {
  onCancel: () => void;
  onOk: () => void;
  mediaRecorderRef: React.MutableRefObject<MyMediaRecorder | null>;
}

function Accepted({
  onCancel,
  onOk,
  mediaRecorderRef,
}: IAcceptedProps): JSX.Element {
  const [recording, setRecording] = useState<boolean>(false);
  const [chosenNote, setChosenNote] = useState<string>("C4");
  const synth = new Synth().toDestination();

  function handleChange(event: SelectChangeEvent<string>): void {
    const note = event.target.value;
    setChosenNote(note);
    synth.triggerAttackRelease(note, "2n");
  }

  function handleRecordOnClick(): void {
    if (recording) {
      handleRecordOnStop();
    } else {
      handleRecordOnStart();
    }
  }

  function handleRecordOnStart(): void {
    setRecording(true);
    mediaRecorderRef.current?.start();
  }

  function handleRecordOnStop(): void {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  }

  async function handleOnApply() {
    if (mediaRecorderRef.current?.blob) {
      const arrayBuffer = await mediaRecorderRef.current.blob.arrayBuffer();
      await myMidiPlayer.useRecordedSound(chosenNote, arrayBuffer);
      onOk();
    }
  }

  return (
    <React.Fragment>
      <DialogContent>
        <DialogContentText>Match your sound with this note</DialogContentText>
        <Grid container gap={2} justifyContent="center" alignItems="center">
          <Grid item xs={2}>
            <NoteSelector chosenNote={chosenNote} onChange={handleChange} />
          </Grid>
          <Grid item xs={1}>
            <RecordButton recording={recording} onClick={handleRecordOnClick} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onCancel()} color="primary">
          Close
        </Button>
        <Button color="primary" variant="contained" onClick={handleOnApply}>
          Apply
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

interface INoteSelector {
  chosenNote: string;
  onChange: (e: SelectChangeEvent<string>) => void;
}

function NoteSelector({ chosenNote, onChange }: INoteSelector) {
  return (
    <form noValidate style={{ width: "fit-content" }}>
      <FormControl>
        <Select value={chosenNote} onChange={onChange} autoFocus>
          {Object.keys(PIANO_TUNING).map((note) => (
            <MenuItem key={note} value={note}>
              {note}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </form>
  );
}
