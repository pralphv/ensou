import React, { useState, useCallback, useEffect } from "react";

import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { Typography } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { storageRef } from "firebaseApi/firebase";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { VariantType, useSnackbar } from "notistack";
import { Player } from "midi-player-js";

import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import { setFileName } from "./fileReaderSlice";

interface FileReaderProps {
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void;
}

function useAvailableUserUploadedMidis(): string[] {
  const [midiNames, setMidiNames] = useState<string[]>([]);
  useEffect(() => {
    async function load() {
      console.log("Loading Midis");
      const midisRef = storageRef.child("midi");
      try {
        const result = await midisRef.listAll();
        const midiNames_: string[] = result.items.map(
          (itemRef) => itemRef.name
        );
        setMidiNames(midiNames_);
        console.log("Successfully loaded Midis");
      } catch (error) {
        console.log(`Fetch user uploaded midis error: ${error}`);
      }
    }
    load();
  }, []);
  return midiNames;
}

function useLoadLocal(loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void): [string, any] {
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleNotification = (message: string, variant: VariantType) => () => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(message, { variant });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const reader = new FileReader();
    reader.onabort = (e) => handleNotification("onabort error", "error");
    reader.onerror = (e) => handleNotification("load error", "error");
    reader.onload = (r: any) => {
      const data: any = r.target.result;
      if (data) {
        loadArrayBuffer(data);
      }
    };
    try {
      if (acceptedFiles[0]) {
        console.log(`Reading: ${acceptedFiles[0].name}`);
        reader.readAsArrayBuffer(acceptedFiles[0]);
        setFileName(acceptedFiles[0].name);
        console.log(`Successfully read: ${acceptedFiles[0].name}`);
      }
    } catch (error) {
      handleNotification(error, "error");
      console.log(error);
    }
  }, []);
  return [fileName, onDrop];
}

async function downloadMidi(loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void, fileName: string) {
  const midiRef = storageRef.child("midi").child(fileName);
  const url = await midiRef.getDownloadURL();
  const xhr = new XMLHttpRequest();
  xhr.responseType = "arraybuffer";
  xhr.onload = () => {
    const blob = xhr.response;
    loadArrayBuffer(blob);
    console.log("File Loaded");
  };
  xhr.open("GET", url);
  xhr.send();
  return true;
}

export default function FileReader_({ loadArrayBuffer }: FileReaderProps) {
  const [fileName, onDrop] = useLoadLocal(loadArrayBuffer);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const midiNames = useAvailableUserUploadedMidis();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const dispatch = useDispatch();

  async function handleOnChange(e: any) {
    const value = e.target.value;
    if (value !== "upload") {
      try {
        setIsLoading(true);
        await downloadMidi(loadArrayBuffer, value);
        setIsLoading(false);
        dispatch(setFileName(value));
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {isDragActive ? (
        <Typography>Drop Here</Typography>
      ) : (
        <FormControl>
          <InputLabel>Pick a song</InputLabel>
          <Select onChange={handleOnChange}>
            {midiNames.map((name: string) => (
              <MenuItem value={name}>{name}</MenuItem>
            ))}
            <MenuItem value={"upload"}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                {fileName || "Load song from computer"}
              </div>
            </MenuItem>
          </Select>
        </FormControl>
      )}
    </div>
  );
}
