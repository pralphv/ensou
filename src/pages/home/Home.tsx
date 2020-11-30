import React, { useState, useEffect } from "react";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import InputBase from "@material-ui/core/InputBase";
import { useFirestore } from "react-redux-firebase";
import IconButton from "@material-ui/core/IconButton";
import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import SongTable from "features/songTable/SongTable";

import SearchIcon from "@material-ui/icons/Search";
import * as types from "features/songTable/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: "2px 4px",
      display: "flex",
      alignItems: "center",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      // width: 400,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  })
);

export default function Home(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<types.ISongTableData[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredTableRows, setFilteredTableRows] = useState<
    types.ISongTableData[]
  >([]);
  const classes = useStyles();
  const firestore = useFirestore();
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

  function handleOnChange(
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = e.target.value;
    setSearchText(value);
    const filtered = tableRows.filter(
      (tableRow) =>
        tableRow.filename.toLowerCase().includes(value) ||
        tableRow.artist.toLowerCase().includes(value)
    );
    setFilteredTableRows(filtered);
  }

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <Paper component="form" className={classes.root} variant="outlined">
            <InputBase
              className={classes.input}
              placeholder="Search for a song"
              onChange={handleOnChange}
            />
            <IconButton type="submit" className={classes.iconButton}>
              <SearchIcon />
            </IconButton>
          </Paper>
          <SongTable tableRows={searchText ? filteredTableRows : tableRows} />
        </div>
      )}
    </div>
  );
}
