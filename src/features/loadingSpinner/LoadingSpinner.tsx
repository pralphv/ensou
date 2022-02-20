import React from "react";
import { CircularProgress } from "@mui/material";

export default function LoadingSpinner() {
  console.log("LoadingSpinner Rerender");
  return (
    <CircularProgress
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
      }}
    />
  );
}
