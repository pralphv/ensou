import React, { useState } from "react";

import Paper from "@mui/material/Paper";

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

interface ISongTableProps {
  tableRows: types.ISongTableData[];
}

export default function SongTable({ tableRows }: ISongTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <Paper
      sx={{
        width: {
          xs: "95vw",
          md: "80vw",
          lg: "70vw",
          xl: "60vw",
        },
      }}
    >
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
