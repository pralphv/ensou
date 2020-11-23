import React from "react";

import { Typography } from "@material-ui/core";
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

interface ILoadingScreenProps {
  text?: string | number;
}

export default function LoadingScreen({ text }: ILoadingScreenProps) {
  console.log("Loading Screen rerender");
  const classes = useStyles();
  // const profile = useUserProfile();
  // <Backdrop className={classes.backdrop} open={!profile.isLoaded}>
  
  return (
    <Backdrop className={classes.backdrop} open={true} invisible={true}>
      <div>
        <CircularProgress color="inherit" />
        {text && <Typography align="center">{text}</Typography>}
      </div>
    </Backdrop>
  );
}
