import React, { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "history";

import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import { Grid, Button, TextField, Typography, Paper } from "@mui/material";

import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import BoldTitle from "features/boldTitle/BoldTitle";
import { Pages } from "layouts/constants";

const LINK_STYLE = {
  textDecoration: "none",
};

const FIELD_WIDTH = {
  width: "100%",
};

const errorInitState = "";

interface ILoginProps {
  history: History;
}

export default function Login({ history }: ILoginProps) {
  const firebase: ExtendedAuthInstance = useFirebase();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [error, setError] = useState<string>(errorInitState);

  function resetErrorState() {
    setError(errorInitState);
  }

  async function handleOnSubmit(e: any) {
    e.preventDefault();
    resetErrorState();
    if (!email || !password) {
      return;
    }
    setLoggingIn(true);
    try {
      await firebase.login({ email, password });

      history.push(Pages.Home);
      window.location.reload();
      //   clearLocalStorage();
    } catch (error: any) {
      const errorCode =
        error.code === "auth/wrong-password" ? "Wrong Password" : error.message;
      setError(errorCode);
    }
    setLoggingIn(false);
  }

  return (
    <Paper
      sx={{
        padding: 2,
        marginTop: "20%",
      }}
    >
      {loggingIn && <LoadingSpinner />}
      <BoldTitle>Welcome</BoldTitle>
      <form
        onSubmit={handleOnSubmit}
        noValidate
        style={{
          marginTop: 30,
          marginBottom: 50,
        }}
      >
        <TextField
          variant="standard"
          sx={FIELD_WIDTH}
          required
          label="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <TextField
          variant="standard"
          sx={FIELD_WIDTH}
          required
          autoComplete="current-password"
          label="Password"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <br />
        <br />
        <Grid container justifyContent="center">
          <Button type="submit" color="primary" variant="contained">
            Submit
          </Button>
        </Grid>
      </form>
      <Grid container justifyContent="space-between">
        <Link to={Pages.ForgotPassword} style={LINK_STYLE}>
          <Typography variant="caption" align="left" color="secondary">
            Forgot Password?
          </Typography>
        </Link>
        <Link to={Pages.Register} style={LINK_STYLE}>
          <Typography variant="caption" align="right" color="secondary">
            Register
          </Typography>
        </Link>
      </Grid>
      <Typography color="error" variant="body2" align="center">
        {error}
      </Typography>
    </Paper>
  );
}
