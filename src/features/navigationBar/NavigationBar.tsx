import React, { useState } from "react";

import { useHistory } from "react-router-dom";

import { Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import PublishIcon from "@mui/icons-material/Publish";

import { useUserId, useIsVerified } from "utils/customHooks";
import { Pages } from "layouts/constants";
import MidiUploadDialog from "features/midiUploadDialog/MidiUploadDialog";
import { logout } from "firebaseApi/crud";
import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

export default function NavigationBar() {
  console.log("Navbar rerender");
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
    <React.Fragment >
      <React.Fragment>
        <AppBar position="static" color="inherit" >
          <Toolbar variant="dense">
            <a
              href={Pages.Home}
              onClick={(e) => {
                e.preventDefault();
                handleOnClick(Pages.Home);
              }}
              style={{ cursor: "pointer" }}
            >
              <Typography variant="h6" noWrap>
                <img
                  src="/ensou.png"
                  height={18}
                  style={{ marginRight: 8 }}
                  alt="ensou.png"
                />
                Ensou
              </Typography>
            </a>
            <div style={{ flexGrow: 1 }} />
            <React.Fragment>
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
            </React.Fragment>
          </Toolbar>
        </AppBar>
      </React.Fragment>
      <MidiUploadDialog open={open} setOpen={setOpen} />
    </React.Fragment>
  );
}
