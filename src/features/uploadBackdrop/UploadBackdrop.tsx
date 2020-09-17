import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    background: "rgba(0, 0, 0, 0.2)",
    zIndex: theme.zIndex.drawer + 1,
  },
}));

export default function UploadBackdrop() {
  console.log("Loading Upload Backdrop");
  const classes = useStyles();

  return (
    <Backdrop className={classes.backdrop} open={true} invisible={true}>
      <Typography variant="h5">Load Midi</Typography>
    </Backdrop>
  );
}
