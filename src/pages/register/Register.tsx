import React, { useEffect, useState } from "react";

import { History } from "history";
import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, TextField, Typography, Paper } from "@material-ui/core";
import { useSnackbar } from "notistack";

import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import BoldTitle from "features/boldTitle/BoldTitle";
import {
  registerUser,
  sendVerification,
  updateDisplayName,
} from "firebaseApi/crud";
import { Pages } from "layouts/constants";
import { validateEmail } from "utils/helper";

const useStyles = makeStyles((theme) => ({
  form: {
    marginTop: 30,
    marginBottom: 50,
  },
  fieldWidth: {
    width: "100%",
  },
  paper: {
    padding: theme.spacing(2),
    marginTop: "20%",
  },
}));

const errorInitState = "";
interface HistoryProps {
  history: History;
}

export default function Register({ history }: HistoryProps) {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [registering, setRegistering] = useState<boolean>(false);
  const [error, setError] = useState<string>(errorInitState);
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  const firebase: ExtendedAuthInstance = useFirebase();

  function resetErrorState() {
    setError(errorInitState);
  }

  useEffect(() => {
    if (!!!password || !!!password2) {
      return;
    }
    if (password !== password2) {
      setError("Passwords are different");
    } else {
      resetErrorState();
    }
  }, [password, password2]);

  async function handleOnSubmit(e: any) {
    e.preventDefault();
    if (!(email && password && password2)) {
      return;
    }
    setError("");
    const emailError = validateEmail(email);
    if (emailError) {
      setError("Incorrect email format");
      return;
    }
    setRegistering(true);
    try {
      await registerUser(firebase, email, password);
      await updateDisplayName(firebase, username);
      await sendVerification(firebase);
      enqueueSnackbar("Register successful. Please verify Email", {
        variant: "success",
      });
      history.push(Pages.Home);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
    setRegistering(false);
  }

  return (
    <Paper className={classes.paper}>
      {registering && <LoadingSpinner />}
      <BoldTitle>Register</BoldTitle>
      <form onSubmit={handleOnSubmit} noValidate className={classes.form}>
        <TextField
          className={classes.fieldWidth}
          required
          label="Username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
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
          label="Password"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <TextField
          className={classes.fieldWidth}
          required
          label="Confirm Password"
          type="password"
          onChange={(e) => {
            setPassword2(e.target.value);
          }}
        />
        <br />
        <br />
        <Grid container justify="center">
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={!!error}
          >
            Submit
          </Button>
        </Grid>
      </form>
      <Typography color="error" variant="body2" align="center">
        {error}
      </Typography>
    </Paper>
  );
}
