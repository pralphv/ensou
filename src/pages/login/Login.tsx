import React, { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "history";

import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import {
  Grid,
  Button,
  makeStyles,
  TextField,
  Typography,
  Paper,
} from "@material-ui/core";

import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
// import BoldTitle from "features/boldTitle/BoldTitle";
import { Pages } from "layouts/constants";

// import { PADDING_SPACE, MAX_WIDTH } from "../styles";
// import { clearLocalStorage } from "localStorage/api";

const useStyles = makeStyles((theme) => ({
  progress: {
    margin: theme.spacing(2),
  },
  link: {
    textDecoration: "none",
  },
  form: {
    marginTop: 30,
    marginBottom: 50,
  },
  fieldWidth: {
    width: "100%",
  },
  paper: {
    // padding: theme.spacing(PADDING_SPACE),
    // maxWidth: MAX_WIDTH,
    marginTop: "20%"
  },
}));

const errorInitState = "";

interface LoginProps {
  history: History;
}

export default function Login({ history }: LoginProps) {
  const firebase: ExtendedAuthInstance = useFirebase();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [error, setError] = useState<string>(errorInitState);

  const classes = useStyles();

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
    } catch (error) {
      const errorCode =
        error.code === "auth/wrong-password" ? "Wrong Password" : error.message;
      setError(errorCode);
    }
    setLoggingIn(false);
  }

  return (
    <Paper className={classes.paper}>
      {loggingIn && <LoadingSpinner />}
      {/* <BoldTitle>Welcome</BoldTitle> */}
      <form onSubmit={handleOnSubmit} noValidate className={classes.form}>
        <TextField
          className={classes.fieldWidth}
          required
          label="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <TextField
          className={classes.fieldWidth}
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
        <Grid container justify="center">
          <Button type="submit" color="primary" variant="contained">
            Submit
          </Button>
        </Grid>
      </form>
      <Grid container justify="space-between">
        <Link to={Pages.ForgotPassword} className={classes.link}>
          <Typography variant="caption" align="left" color="secondary">
            Forgot Password?
          </Typography>
        </Link>
        <Link to={Pages.Register} className={classes.link}>
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
