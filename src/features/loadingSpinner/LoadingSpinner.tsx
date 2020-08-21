import React from "react";
import { makeStyles, CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -25,
    marginTop: -25,
  },
}));

export default function LoadingSpinner() {
  const classes = useStyles();
  console.log("LoadingSpinner Rerender");
  return <CircularProgress className={classes.loading} />;
}
