import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core";

// import { useUserProfile } from "utils/customHooks";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    background: "rgba(0, 0, 0, 0.2)",
    zIndex: theme.zIndex.drawer + 1,
  },
}));

export default function LoadingScreen() {
  console.log("LoadingScreen rerender");
  const classes = useStyles();
  // const profile = useUserProfile();
  // <Backdrop className={classes.backdrop} open={!profile.isLoaded}>

  return (
    <Backdrop className={classes.backdrop} open={true} invisible={true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
