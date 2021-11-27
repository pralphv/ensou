import React from "react";
import Backdrop from "@mui/material/Backdrop";
import { makeStyles } from "@mui/styles";
import { Typography } from "@mui/material";

// const useStyles = makeStyles((theme) => ({
//   backdrop: {
//     background: "rgba(0, 0, 0, 0.2)",
//     zIndex: theme.zIndex.drawer + 1,
//   },
// }));

export default function UploadBackdrop() {
  console.log("Loading Upload Backdrop");

  return (
    <Backdrop
      sx={{ bgcolor: "rgba(0, 0, 0, 0.2)", zIndex: "drawer" }}
      open={true}
      invisible={true}
    >
      <Typography variant="h5">Load Midi</Typography>
    </Backdrop>
  );
}
