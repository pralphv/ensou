import React, { useMemo } from "react";
import { useDropzone } from "react-dropzone";

import FolderIcon from "@material-ui/icons/Folder";

import CustomButton from "./cutomButton/CustomButton";
import { useLoadLocal } from "utils/customHooks";
import UploadBackdrop from "features/uploadBackdrop/UploadBackdrop";
import myMidiPlayer from "audio";

export default function FileReaderButton(): JSX.Element {
  const [onLoadMidiFile] = useLoadLocal(myMidiPlayer.loadArrayBuffer);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onLoadMidiFile,
    disabled: myMidiPlayer.getIsPlaying(),
  });
  const fileReaderButtonMemo = useMemo(
    () => (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive && <UploadBackdrop />}
        <CustomButton disabled={myMidiPlayer.getIsPlaying()} size="small">
          <FolderIcon />
        </CustomButton>
      </div>
    ),
    [myMidiPlayer.getIsPlaying()]
  );
  return fileReaderButtonMemo;
}
