import React from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
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
  isHqApi: types.IMidiFunctions["isHqApi"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];
}

export default function SettingsMenu({
  soundEffect,
  forceRerender,
  isHqApi,
  getIsPlaying,
  metronomeApi,
  loopApi,
}: ISettingsMenu): JSX.Element {
  const classes = useStyles();

  function handleOnChangeSoundEffect() {
    if (soundEffect.getIsSoundEffect()) {
      soundEffect.setIsNotSoundEffect();
    } else {
      soundEffect.setIsSoundEffect();
    }
    forceRerender();
  }

  function handleOnChangeHq() {
    if (isHqApi.getIsHq()) {
      isHqApi.setIsNotHq();
    } else {
      isHqApi.setIsHq();
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
    <List component="nav" className={classes.root}>
      <ListItem button>
        <ListItemText primary="Sound Effect" />
        <Switch
          checked={soundEffect.getIsSoundEffect()}
          onChange={handleOnChangeSoundEffect}
        />
      </ListItem>
      <ListItem button>
        <ListItemText primary="High Quality" />
        <Switch
          // color="secondary"
          checked={isHqApi.getIsHq()}
          onChange={handleOnChangeHq}
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
    </List>
  );
}
