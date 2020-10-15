import React, { Fragment, useState, useEffect } from "react";
import clsx from "clsx";

import { useHistory } from "react-router-dom";
import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";

import LoadingScreen from "features/loadingScreen/LoadingScreen";
import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import { storageRef } from "firebaseApi/firebase";
import SongTable from "features/songTable/SongTable";

import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: "200px",
  },
  width: {
    width: "250px",
  },
  paper: {
    padding: theme.spacing(2),
    cursor: "pointer",
    "&:hover": {
      background: "#353535",
    },
  },
}));

const MAX_BOX_HEIGHT: number = 200;

function useAvailableUserUploadedMidis(): string[] {
  const [midiNames, setMidiNames] = useState<string[]>([]);
  useEffect(() => {
    async function load() {
      console.log("Loading Midis");
      const midisRef = storageRef.child("midi");
      try {
        const result = await midisRef.listAll();
        const midiNames_: string[] = result.items.map(
          (itemRef) => itemRef.name
        );
        setMidiNames(midiNames_);
        console.log("Successfully loaded Midis");
      } catch (error) {
        console.log(`Fetch user uploaded midis error: ${error}`);
      }
    }
    load();
  }, []);
  return midiNames;
}

export default function Home(): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const loading: boolean = false;
  const midiNames = useAvailableUserUploadedMidis();

  return (
    <div>
      {/* <LoadingScreen /> */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {/* <Autocomplete
            options={midiNames}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "50vw",
                }}
              >
                <SearchIcon
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 15,
                    width: 20,
                    height: 20,
                  }}
                />
                <TextField {...params} variant="outlined" />
              </div>
            )}
          /> */}
          <SongTable />
        </div>
      )}
    </div>
  );
}
