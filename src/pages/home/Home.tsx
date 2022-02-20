import React, { useState, useEffect } from "react";

import { useFirestore } from "react-redux-firebase";

import SongTable from "features/songTable/SongTable";
import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import * as types from "features/songTable/types";
import SearchBar from "./searchBar";

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
