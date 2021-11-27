import React, { useState } from "react";
import { History } from "history";

import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import { Grid, Button, Typography, Paper, TextField } from "@mui/material";
import { useSnackbar } from "notistack";

import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
import BoldTitle from "features/boldTitle/BoldTitle";
import { validateEmail } from "utils/helper";
import { sendPasswordResetEmail } from "firebaseApi/crud";
// import { PADDING_SPACE, MAX_WIDTH } from "../styles";

const errorInitState = "";

interface ForgotPasswordProps {
  history: History;
}

export default function ForgotPassword({ history }: ForgotPasswordProps) {
  const firebase: ExtendedAuthInstance = useFirebase();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(errorInitState);
  const { enqueueSnackbar } = useSnackbar();

  function resetErrorState() {
    setError(errorInitState);
  }

  async function handleOnSubmit(e: any) {
    e.preventDefault();
    resetErrorState();
    if (!email) {
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(firebase, email);
      enqueueSnackbar("Email has been sent succesffully", {
        variant: "success",
      });
    } catch (e: any) {
      setError(e.message);
    }
    setSubmitting(false);
  }

  return (
    <Paper
      sx={{
        padding: 2,
        // maxWidth: MAX_WIDTH,
        marginTop: "20%",
      }}
    >
      {submitting && <LoadingSpinner />}
      <BoldTitle>Reset Password</BoldTitle>
      <form onSubmit={handleOnSubmit} noValidate>
        <TextField
          variant="standard"
          error={!!error}
          sx={{ width: "100%" }}
          required
          label="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <br />
        <br />
        <Grid container justifyContent="center">
          <Button type="submit" color="primary" variant="contained">
            Submit
          </Button>
        </Grid>

        <Typography color="error" variant="body2" align="center">
          {error}
        </Typography>
      </form>
    </Paper>
  );
}
