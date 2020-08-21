import React, { useState } from "react";

import { useHistory } from "react-router-dom";
// import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import {
  Drawer,
  List,
  makeStyles,
  ListItem,
  ListItemIcon,
  BottomNavigation,
  BottomNavigationAction,
  Tooltip,
  Typography,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import MusicNoteIcon from "@material-ui/icons/MusicNote";
import SearchIcon from "@material-ui/icons/Search";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";

import { useIsMobile } from "utils/customHooks";
import { Pages } from "layouts/constants";
// import { logout } from "firebaseApi/crud";

import * as types from "./types";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: theme.spacing(7) + 1,
    overflowX: "hidden",
    overflowY: "hidden",
  },
  drawer: {
    flexShrink: 0,
    whiteSpace: "nowrap",
    width: theme.spacing(7) + 1,
  },
  icon: {
    fontSize: 24,
  },
  iconContainer: {
    paddingTop: 25,
    paddingBottom: 25,
  },
  navBarBackground: {
    bottom: 0,
    left: 0,
    position: "fixed",
    width: "100%",
    zIndex: 4500,
    whiteSpace: "nowrap",
  },
  iconText: {
    fontWeight: 800,
    fontSize: 20,
  },
}));

const iconStyleOveride = makeStyles((theme) => ({
  root: {
    // minWidth: 60,
    color: "#fff",
  },
  selected: {},
}));

let ICONS: types.NavBarIcon[] = [
  {
    label: "Home",
    icon: HomeIcon,
    to: Pages.Home,
  },
  {
    label: "Search",
    icon: SearchIcon,
    to: "",
  },
  {
    label: "Player",
    icon: MusicNoteIcon,
    to: Pages.Interface,
  },
];

let LOGGEDIN_ICONS: types.NavBarIcon[] = [
  {
    label: "Logout",
    icon: ExitToAppIcon,
    to: Pages.Logout,
  },
];

let LOGGEDOUT_ICONS: types.NavBarIcon[] = [
  {
    label: "Login",
    icon: AccountBoxIcon,
    to: Pages.Login,
  },
];

export default function NavigationBar() {
  console.log("Navbar rerender");
  const classes = useStyles();
  const iconStyleOverideClasses = iconStyleOveride();
  const isMobile = useIsMobile();
  const history = useHistory();
  const [open, setOpen] = useState<boolean>(false);
  // const isLoggedIn = useIsVerified();
  // const firebase: ExtendedAuthInstance = useFirebase();
  // const iconsToShow = isLoggedIn
  //   ? [...ICONS, ...LOGGEDIN_ICONS]
  //   : [...ICONS, ...LOGGEDOUT_ICONS];
  const iconsToShow = [...ICONS, ...LOGGEDOUT_ICONS];

  async function handleOnClick(path: string) {
    if (path === Pages.Logout) {
      // await logout(firebase);
      window.location.reload();
    } else {
      history.push(path);
    }
  }

  return (
    <div>
      {isMobile ? (
        // <BottomNavigation className={classes.navBarBackground} showLabels>
        //   {iconsToShow.map((obj: types.NavBarIcon) => (
        //     <BottomNavigationAction
        //       classes={iconStyleOverideClasses}
        //       label={obj.label}
        //       icon={<obj.icon />}
        //       key={obj.label}
        //       onClick={() => handleOnClick(obj.to)}
        //       value={obj.label}
        //     />
        //   ))}
        // </BottomNavigation>
        <AppBar
          position="fixed"
          // className={clsx(classes.appBar, {
          //   [classes.appBarShift]: open,
          // })}
        >
          <Toolbar variant="dense">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              // onClick={handleDrawerOpen}
              edge="start"
              // className={clsx(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Persistent drawer
            </Typography>
          </Toolbar>

          <SwipeableDrawer
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
          >
          </SwipeableDrawer>
        </AppBar>
      ) : (
        <Drawer
          variant="permanent"
          className={classes.drawer}
          classes={{
            paper: classes.paper,
          }}
          color="#fff"
        >
          <List>
            {iconsToShow.map((obj: types.NavBarIcon, i: number) => (
              <Tooltip key={i} title={obj.label}>
                <ListItem
                  button
                  className={classes.iconContainer}
                  onClick={() => handleOnClick(obj.to)}
                >
                  <ListItemIcon>
                    <obj.icon className={classes.icon} />
                  </ListItemIcon>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Drawer>
      )}
    </div>
  );
}
