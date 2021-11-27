import React from "react";

import { Typography, Grid } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

interface ILoadingScreenProps {
  text?: string | number;
}

export default function LoadingScreen({ text }: ILoadingScreenProps) {
  console.log("Loading Screen rerender");

  return (
    <Backdrop
      // sx={{
        // background: "rgba(0, 0, 0, 0.2)",
        // zIndex: theme.zIndex.drawer + 1,
      // }}
      open={true}
      invisible={true}
    >
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress color="inherit" />
        {text && <Typography align="center">{text}</Typography>}
      </Grid>
    </Backdrop>
  );
}
