import React, { useState } from "react";
import { History } from "history";

import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

import { Button } from "@material-ui/core";
import { useSnackbar } from "notistack";

import { sendVerification } from "firebaseApi/crud";
import { Pages } from "layouts/constants";

interface ForgotPasswordProps {
  history: History;
}

export default function Verification({ history }: ForgotPasswordProps) {
  const firebase: ExtendedAuthInstance = useFirebase();
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  async function handleOnSubmit(e: any) {
    e.preventDefault();
    setSubmitting(true);
    const resp = await sendVerification(firebase);
    if (resp.status === "error") {
      enqueueSnackbar(resp.message, {
        variant: "error",
      });
      console.error({ resp });
    } else {
      enqueueSnackbar("Email has been sent succesffully", {
        variant: "success",
      });
      history.push(Pages.Home);
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
