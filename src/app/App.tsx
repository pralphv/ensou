import React from "react";

import { ReactReduxFirebaseProvider } from "react-redux-firebase";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import { createFirestoreInstance } from "redux-firestore";

import "./App.css";
import MainLayout from "../layouts/mainLayout";
import { THEME } from "./theme";
import firebase from "firebaseApi";
import store from "./store";

const rrfConfig = {
  userProfile: "users",
};

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance,
};

export default function App() {
  return (
    <ReactReduxFirebaseProvider {...rrfProps}>
      <ThemeProvider theme={THEME}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <MainLayout />
        </SnackbarProvider>
      </ThemeProvider>
    </ReactReduxFirebaseProvider>
  );
}
