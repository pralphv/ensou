import React, { useState } from "react";
import { keys } from "idb-keyval";

import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import * as types from "types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "absolute",
      backgroundColor: theme.palette.background.paper,
      zIndex: 100,
      marginTop: `-${55 * 4}px`,
      right: "38px",
      opacity: 0.9,
    },
  })
);

interface ISettingsMenu {
  soundEffect: types.IMidiFunctions["soundEffect"];
  forceRerender: types.forceRerender;
  isUseSamplerApi: types.IMidiFunctions["isUseSamplerApi"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];
}

export default function SettingsMenu({
  soundEffect,
  forceRerender,
  isUseSamplerApi,
  getIsPlaying,
  metronomeApi,
  loopApi,
}: ISettingsMenu): JSX.Element {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  function handleOnChangeSoundEffect() {
    if (soundEffect.getIsSoundEffect()) {
      soundEffect.setIsNotSoundEffect();
    } else {
      soundEffect.setIsSoundEffect();
    }
    forceRerender();
  }

  async function handleOnChangeDialog() {
    if (isUseSamplerApi.getIsUseSampler()) {
      handleOnChangeIsUseSampler();
    } else {
      const idbCachedKeys = (await keys()) as string[];
      if (!idbCachedKeys.includes("piano_PedalOffMezzoForte1")) {
        setDialogOpen(true);
      } else {
        handleOnChangeIsUseSampler();
      }
    }
  }

  function handleOnChangeIsUseSampler() {
    if (isUseSamplerApi.getIsUseSampler()) {
      isUseSamplerApi.setIsNotUseSampler();
    } else {
      isUseSamplerApi.setIsUseSampler();
    }
    forceRerender();
  }

  function handleOnChangeMetronome() {
    if (metronomeApi.getIsMetronome()) {
      metronomeApi.setIsNotMetronome();
    } else {
      metronomeApi.setIsMetronome();
    }
    forceRerender();
  }

  function handleOnChangeLoop() {
    if (loopApi.getIsLoop()) {
      loopApi.setIsNotLoop();
    } else {
      loopApi.setIsLoop();
    }
    forceRerender();
  }

  return (
    <List
      component="nav"
      style={{
        // not use mui for speed sorry
        position: "absolute",
        backgroundColor: "#1e1e1e",
        zIndex: 100,
        marginTop: `-${55 * 4}px`,
        right: "38px",
        opacity: 0.9,
      }}
    >
      <ListItem button>
        <ListItemText primary="Sound Effect" />
        <Switch
          checked={soundEffect.getIsSoundEffect()}
          onChange={handleOnChangeSoundEffect}
        />
      </ListItem>
      <ListItem button>
        <ListItemText primary="Use Samples" />
        <Switch
          // color="secondary"
          checked={isUseSamplerApi.getIsUseSampler()}
          onChange={handleOnChangeDialog}
          disabled={getIsPlaying()}
        />
      </ListItem>
      <ListItem button>
        <ListItemText primary="Metronome" />
        <Switch
          // color="secondary"
          checked={metronomeApi.getIsMetronome()}
          onChange={handleOnChangeMetronome}
        />
      </ListItem>
      <ListItem button>
        <ListItemText primary="Loop" />
        <Switch
          // color="secondary"
          checked={loopApi.getIsLoop()}
          onChange={handleOnChangeLoop}
        />
      </ListItem>
      <ConfirmationDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onClick={() => {
          handleOnChangeIsUseSampler();
          setDialogOpen(false);
        }}
      />
    </List>
  );
}

interface IConfirmationDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
  onClick: () => void;
}

function ConfirmationDialog({ open, setOpen, onClick }: IConfirmationDialog) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Download Samples?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Total file size is 10MB. Using samples may affect performance. Are you
          sure you want to use samples?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={onClick} color="primary" autoFocus variant="contained">
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
