import React from "react";

import { Typography, Box } from "@material-ui/core";

interface BoldTitleProps {
  children: string;
}

export default function BoldTitle({ children }: BoldTitleProps) {
  return (
    <Typography color="secondary" variant="h5" gutterBottom>
      <Box fontWeight="fontWeightBold">{children}</Box>
    </Typography>
  );
}
