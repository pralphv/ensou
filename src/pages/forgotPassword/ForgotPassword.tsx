export const jer: number = 1;

// import React, { useState } from "react";
// import { History } from "history";

// import { ExtendedAuthInstance, useFirebase } from "react-redux-firebase";

// import {
//   makeStyles,
//   Grid,
//   Button,
//   Typography,
//   Paper,
//   TextField,
// } from "@material-ui/core";

// import LoadingSpinner from "features/loadingSpinner/LoadingSpinner";
// import BoldTitle from "features/boldTitle/BoldTitle";
// import NotificationPopUp from "features/notificationPopUp/NotificationPopUp";
// import { validateEmail } from "utils/helper";
// import { sendPasswordResetEmail } from "firebaseApi/crud";
// import { PADDING_SPACE, MAX_WIDTH } from "../styles";

// const errorInitState = "";

// const useStyles = makeStyles((theme) => ({
//   form: {
//     marginTop: 30,
//     marginBottom: 50,
//   },
//   paper: {
//     padding: theme.spacing(PADDING_SPACE),
//     maxWidth: MAX_WIDTH,
//     marginTop: "20%"
//   },
//   fieldWidth: {
//     width: "100%",
//   },
// }));

// interface ForgotPasswordProps {
//   history: History;
// }

// export default function ForgotPassword({ history }: ForgotPasswordProps) {
//   const firebase: ExtendedAuthInstance = useFirebase();
//   const [email, setEmail] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(errorInitState);
//   const [notificationOpen, setNotificationOpen] = useState(false);

//   const classes = useStyles();

//   function resetErrorState() {
//     setError(errorInitState);
//   }

//   async function handleOnSubmit(e: any) {
//     e.preventDefault();
//     resetErrorState();
//     if (!email) {
//       return;
//     }
//     const emailError = validateEmail(email);
//     if (emailError) {
//       setError(emailError);
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await sendPasswordResetEmail(firebase, email);
//       setNotificationOpen(true);
//     } catch (error) {
//       setError(error.message);
//     }
//     setSubmitting(false);
//   }

//   return (
//     <Paper className={classes.paper}>
//       {submitting && <LoadingSpinner />}
//       <BoldTitle>Reset Password</BoldTitle>
//       <form onSubmit={handleOnSubmit} noValidate>
//         <TextField
//           error={!!error}
//           className={classes.fieldWidth}
//           required
//           label="Email"
//           onChange={(e) => {
//             setEmail(e.target.value);
//           }}
//         />
//         <br />
//         <br />
//         <Grid container justify="center">
//           <Button type="submit" color="primary" variant="contained">
//             Submit
//           </Button>
//         </Grid>

//         <Typography color="error" variant="body2" align="center">
//           {error}
//         </Typography>
//       </form>
//       <NotificationPopUp
//         active={notificationOpen}
//         setState={setNotificationOpen}
//         text="Password reset email has been sent"
//       />
//     </Paper>
//   );
// }
