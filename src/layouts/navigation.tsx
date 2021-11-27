import React from "react";

import Grid from "@mui/material/Grid";

import NavigationBar from "features/navigationBar/NavigationBar";

export interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps): JSX.Element {
  return (
    <div>
      <NavigationBar />
      <Grid
        container
        gap={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        {children}
      </Grid>
    </div>
  );
}
