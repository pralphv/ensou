import React, { useEffect, useState } from "react";

import { useFirestore } from "react-redux-firebase";
import { useHistory } from "react-router-dom";
import { Pages } from "layouts/constants";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import LoadingScreen from "features/loadingScreen/LoadingScreen";
import OneRowCard from "./OneRowCard";
import * as types from "./types";

function convertDateToYYYYMMDD(d: Date): string {
  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    )
    // `toIsoString` returns something like "2017-08-22T08:32:32.847Z"
    // and we want the first part ("2017-08-22")
  )
    .toISOString()
    .slice(0, 10);
}
const useStyles = makeStyles((theme) => ({
  root: {
    width: "60vw",
    [theme.breakpoints.down("sm")]: {
      width: "100vw",
    },
  },
}));

export default function SongTable() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  function handleChangePage(event: unknown, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  function handleOnClick(songId: string) {
    history.push(`${Pages.Player}/${songId}`);
  }

  const firestore = useFirestore();
  const [tableRows, setTableRows] = useState<types.ISongTableData[]>([]);
  useEffect(() => {
    async function fetchSongTable() {
      setIsLoading(true);
      const ref = await firestore.collection("midi");
      const snapshot = await ref.get();
      const midi: types.ISongTableData[] = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      }) as types.ISongTableData[];
      setTableRows(midi);
      setIsLoading(false);
    }
    fetchSongTable();
  }, []);
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const history = useHistory();

  return (
    isLoading? <LoadingScreen/>:
    <Paper className={classes.root}>
      {tableRows
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row: types.ISongTableData, i: number) => (
          <OneRowCard
            key={row.id}
            instrument={row.instrument}
            filename={row.filename}
            artist={row.artist}
            transcribedBy={row.transcribedBy}
            uploader={row.uploader}
            id={row.id}
            date={convertDateToYYYYMMDD(row.date.toDate())}
          />
        ))}
    </Paper>
  );
}
