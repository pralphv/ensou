import React, { useState } from "react";

import { useHistory } from "react-router-dom";
// import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import { Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import PublishIcon from "@material-ui/icons/Publish";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import { useUserId, useIsVerified } from "utils/customHooks";
import { Pages } from "layouts/constants";
import MidiUploadDialog from "features/midiUploadDialog/MidiUploadDialog";
import { logout } from "firebaseApi/crud";
import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pointer: {
      cursor: "pointer",
    },
    grow: {
      flexGrow: 1,
    },
  })
);

export default function NavigationBar() {
  console.log("Navbar rerender");
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = useState<boolean>(false);
  const isVerified = useIsVerified();
  const uid = useUserId();
  const firebase: ExtendedAuthInstance = useFirebase();

  async function handleOnClick(path: string) {
    if (path === Pages.Login && uid) {
      await logout(firebase);
    } else {
      history.push(path);
    }
  }

  function handleOpenDialog() {
    if (uid && isVerified) {
      setOpen(true);
    } else if (uid && !isVerified) {
      history.push(Pages.Verify);
    } else {
      history.push(Pages.Login);
    }
  }

  return (
    <div>
      <div className={classes.grow}>
        <AppBar position="static" color="inherit">
          <Toolbar variant="dense">
            <div
              onClick={() => handleOnClick(Pages.Home)}
              className={classes.pointer}
            >
              <Typography variant="h6" noWrap>
                <img src="/ensou.png" height={18} style={{ marginRight: 8 }} />
                Ensou
              </Typography>
            </div>
            <div className={classes.grow} />
            <div>
              <IconButton aria-label="publish" onClick={handleOpenDialog}>
                <PublishIcon />
              </IconButton>
              <IconButton
                aria-label="account"
                onClick={() => handleOnClick(Pages.Login)}
              >
                <AccountBoxIcon />
                <Typography>{uid ? "LOG OUT" : "SIGN IN"}</Typography>
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      </div>

      <MidiUploadDialog open={open} setOpen={setOpen} />
    </div>
  );
}
