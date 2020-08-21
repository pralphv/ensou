import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

interface Column {
  id: "name" | "artist" | "instrument" | "uploader";
  label: string;
  align?: "right";
}

const columns: Column[] = [
  { id: "name", label: "" },
  { id: "artist", label: "Artist", align: "right" },
  { id: "instrument", label: "Instrument", align: "right" },
  { id: "uploader", label: "Uploader", align: "right" },
];

interface Data {
  name: string;
  artist: string;
  instrument: string;
  uploader: string;
}

function createData(
  name: string,
  artist: string,
  instrument: string,
  uploader: string
): Data {
  return { name, artist, instrument, uploader };
}

const rows = [
  createData("Micheal Angelo Bass", "IMicheal Angelo BassN", "Piano", "bigbig"),
  createData("Micheal Angelo Bass", "Micheal Angelo Bass", "Piano", "bigbig"),
  createData("Micheal Angelo Bass", "Micheal Angelo Bass", "Piano", "bigbig"),
  createData("Micheal Angelo Bass", "Micheal Angelo Bass", "Piano", "bigbig"),
  createData("Micheal Angelo Bass", "CMicheal Angelo BassA", "Piano", "bigbig"),
  createData("Micheal Angelo Bass", "AMicheal Angelo BassU", "Piano", "bigbig"),
  createData("Micheal Angelo Bass", "Micheal Angelo BassDE", "Piano", "bigbig"),
  createData(
    "Micheal Angelo Bass",
    "IMicheal Angelo BassE",
    "Kalimba",
    "bigbig"
  ),
  createData("Micheal Angelo Bass", "MX", "Kalimba", "bigbig"),
  createData(
    "Micheal Angelo Bass",
    "JPMicheal Angelo Bass",
    "Kalimba",
    "bigbig"
  ),
  createData("Micheal Angelo Bass", "FR", "Kalimba", "bigbig"),
  createData("Micheal Angelo Bass", "GB", "Kalimba", "bigbig"),
  createData("Micheal Angelo Bass", "RU", "Kalimba", "bigbig"),
  createData("Micheal Angelo Bass", "NG", "Kalimba", "bigbig"),
  createData("Micheal Angelo Bass", "BR", "Kalimba", "bigbig"),
];

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  row: {
      cursor: "pointer"
  }
});

export default function SongTable() {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, i: number) => {
                return (
                  <TableRow hover key={i} className={classes.row}>
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align}>
                        {row[column.id]}
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
