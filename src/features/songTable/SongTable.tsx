import React, { useEffect, useState } from "react";

import { ExtendedFirebaseInstance, useFirebase } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { RootState } from "app/rootReducer";
import { useFirestore } from "react-redux-firebase";
import { useHistory } from "react-router-dom";
import { Pages } from "layouts/constants";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

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

interface Column {
  id: "name" | "artist" | "instrument" | "uploader" | "date";
  label: string;
  align?: "right";
}

const columns: Column[] = [
  { id: "name", label: "" },
  { id: "artist", label: "Artist", align: "right" },
  { id: "instrument", label: "Instrument", align: "right" },
  { id: "uploader", label: "Uploader", align: "right" },
  { id: "date", label: "Date", align: "right" },
];

interface SongTableData {
  name: string;
  artist: string;
  instrument: string;
  uploader: string;
  date: any;
  id: string;
}

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  row: {
    cursor: "pointer",
  },
});

export default function SongTable() {
  function handleChangePage(event: unknown, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  function handleOnClick(songId: string) {
    history.push(`${Pages.Interface}/${songId}`);
  }

  const firestore = useFirestore();
  const [tableRows, setTableRows] = useState<SongTableData[]>([]);
  useEffect(() => {
    async function fetchSongTable() {
      const ref = await firestore.collection("midi");
      const snapshot = await ref.get();
      const midi: SongTableData[] = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      }) as SongTableData[];
      setTableRows(midi);
    }
    fetchSongTable();
  }, []);
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // console.log(midi);

  const history = useHistory();

  return (
    <Paper className={classes.root}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column: Column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: SongTableData, i: number) => {
                return (
                  <TableRow
                    hover
                    key={i}
                    className={classes.row}
                    onClick={() => handleOnClick(row.id)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align}>
                        {column.id === "date"
                          ? convertDateToYYYYMMDD(row[column.id].toDate())
                          : row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
