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
      width: "15%",
      position: "absolute",
      backgroundColor: theme.palette.background.paper,
      zIndex: 100,
      marginTop: "-8%",
      right: "5%",
      opacity: 0.9,
    },
  })
);

interface ISettingsMenu {
  soundEffect: types.IMidiFunctions["soundEffect"];
  forceRerender: types.forceRerender;
}

export default function SettingsMenu({
  soundEffect,
  forceRerender,
}: ISettingsMenu): JSX.Element {
  const classes = useStyles();

  function handleOnChange() {
    if (soundEffect.getIsSoundEffect()) {
      soundEffect.setIsNotSoundEffect();
    } else {
      soundEffect.setIsSoundEffect();
    }
    forceRerender();
  }

  return (
    <List
      component="nav"
      aria-label="main mailbox folders"
      className={classes.root}
    >
      <ListItem button>
        <ListItemText primary="Sound Effect" />
        <Switch
          // color="secondary"
          checked={soundEffect.getIsSoundEffect()}
          onChange={handleOnChange}
        />
      </ListItem>
      {/* <ListItem button>
        <ListItemText primary="High Quality" />
        <Switch
          // color="secondary"
          checked={soundEffect.getIsSoundEffect()}
          onChange={handleOnChange}
        />
      </ListItem> */}
    </List>
  );
}
