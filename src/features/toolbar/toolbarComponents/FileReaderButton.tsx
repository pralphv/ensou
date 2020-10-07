import React from "react";
import { useDropzone } from "react-dropzone";

import FolderIcon from "@material-ui/icons/Folder";
import { useHotkeys } from "react-hotkeys-hook";

import CustomButton from "./CustomButton";
import { useLoadLocal } from "utils/customHooks";
import UploadBackdrop from "features/uploadBackdrop/UploadBackdrop";
import * as types from "types";

interface FileReaderProps {
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void;
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
}

export default function FileReaderButton({
  loadArrayBuffer,
  getIsPlaying,
}: FileReaderProps): JSX.Element {
  const [onLoadMidiFile] = useLoadLocal(loadArrayBuffer);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onLoadMidiFile,
    disabled: getIsPlaying()
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive && <UploadBackdrop />}
      <CustomButton disabled={getIsPlaying()}
      size="small"
      >
        <FolderIcon />
      </CustomButton>
    </div>
  );
}
