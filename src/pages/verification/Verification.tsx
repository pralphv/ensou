import React, { useState } from "react";
import { History } from "history";

import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import {
  makeStyles,
  Grid,
  Button,
  Typography,
  Paper,
  TextField,
} from "@material-ui/core";
import { useSnackbar } from "notistack";

import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import BoldTitle from "features/boldTitle/BoldTitle";
import { sendVerification } from "firebaseApi/crud";
// import { PADDING_SPACE, MAX_WIDTH } from "../styles";
import { Pages } from "layouts/constants";

const errorInitState = "";

const useStyles = makeStyles((theme) => ({
  form: {
    marginTop: 30,
    marginBottom: 50,
  },
  paper: {
    padding: theme.spacing(2),
    // maxWidth: MAX_WIDTH,
    marginTop: "20%",
  },
  fieldWidth: {
    width: "100%",
  },
}));

interface ForgotPasswordProps {
  history: History;
}

export default function Verification({ history }: ForgotPasswordProps) {
  const firebase: ExtendedAuthInstance = useFirebase();
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();

  async function handleOnSubmit(e: any) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendVerification(firebase);
      enqueueSnackbar("Email has been sent succesffully", {
        variant: "success",
      });
      history.push(Pages.Home);
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
      });
    }
    setSubmitting(false);
  }

  return (
    <Button
      onClick={handleOnSubmit}
      color="primary"
      variant="contained"
      disabled={submitting}
    >
      Re-send verification Email
    </Button>
  );
}
