import React from "react";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles, createStyles } from "@material-ui/core/styles";

import { useHistory } from "react-router-dom";
import { Pages } from "layouts/constants";

import * as types from "./types";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      "&:hover": {
        background: theme.palette.grey[800],
      },
      borderBottom: "1px solid #121212",
      cursor: "pointer",
      padding: theme.spacing(2),
    },
    nowrap: {
      whiteSpace: "nowrap",
    },
  })
);

export default function OneRowCard({
  instrument,
  filename,
  artist,
  transcribedBy,
  date,
  id,
}: types.ISongTableData) {
  const classes = useStyles();
  const history = useHistory();

  function handleOnClick() {
    history.push(`${Pages.Player}/${id}`);
  }

  return (
    <Grid
      container
      className={classes.root}
      spacing={2}
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
            {artist}
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs container direction="column" alignItems="flex-end">
        <Grid item xs>
          <Typography variant="body2" gutterBottom className={classes.nowrap}>
            {transcribedBy}
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography
            variant="caption"
            color="textSecondary"
            className={classes.nowrap}
          >
            {date}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
