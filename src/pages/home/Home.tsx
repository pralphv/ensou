import React, { useState, useEffect } from "react";

import { useFirestore } from "react-redux-firebase";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";

import SongTable from "features/songTable/SongTable";
import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import * as types from "features/songTable/types";

export default function Home(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<types.ISongTableData[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredTableRows, setFilteredTableRows] = useState<
    types.ISongTableData[]
  >([]);
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
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = tableRows.filter(
      (tableRow) =>
        tableRow.filename.toLowerCase().includes(value) ||
        tableRow.artist.toLowerCase().includes(value)
    );
    setFilteredTableRows(filtered);
  }

  return (
    <React.Fragment>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <React.Fragment>
          <SearchBar onChange={handleOnChange} />
          <SongTable tableRows={searchText ? filteredTableRows : tableRows} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

interface ISearchBarProps {
  onChange:
    | React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
    | undefined;
}

function SearchBar({ onChange }: ISearchBarProps) {
  return (
    <Paper
      component="form"
      sx={{
        py: 0.5,
        px: 1,
        display: "flex",
        alignItems: "center",
        marginTop: 2,
        marginBottom: 4,
      }}
      variant="outlined"
    >
      <InputBase
        placeholder="Search for a song"
        onChange={onChange}
        sx={{
          marginLeft: 1,
          flex: 1,
        }}
      />
      <IconButton>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
