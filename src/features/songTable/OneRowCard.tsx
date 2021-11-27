import React from "react";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { useHistory } from "react-router-dom";
import { Pages } from "layouts/constants";

import * as types from "./types";

const NO_WRAP = { whiteSpace: "nowrap" } as const;

export default function OneRowCard({
  instrument,
  filename,
  artist,
  transcribedBy,
  date,
  id,
  uploader,
}: types.ISongTableData) {
  const history = useHistory();

  function handleOnClick() {
    history.push(`${Pages.Player}/${id}`);
  }

  return (
    <Grid
      container
      sx={{
        "&:hover": {
          bgcolor: "grey.800",
        },
        borderBottom: "1px solid #121212",
        cursor: "pointer",
        padding: 2,
      }}
      gap={2}
      onClick={handleOnClick}
    >
      <Grid item>{instrument}</Grid>
      <Grid item xs={6} container direction="column">
        <Grid item xs>
          <Typography variant="body2" gutterBottom>
            {filename}
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography variant="body2" color="textSecondary">
            {artist}{" "}
            <Typography variant="caption">
              Transcribed by {transcribedBy}
            </Typography>
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs container direction="column" alignItems="flex-end">
        <Grid item xs>
          <Typography variant="body2" gutterBottom sx={NO_WRAP}>
            {uploader}
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography variant="caption" color="textSecondary" sx={NO_WRAP}>
            {date}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
