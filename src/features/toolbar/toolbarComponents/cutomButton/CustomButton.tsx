import React from "react";

import ToggleButton from "@mui/lab/ToggleButton";
import "./styles.css";

export default function CustomButton(props: any) {
  return (
    <ToggleButton
      {...props}
      className="custom-button"
      value={props.value || true}
    >
      {props.children}
    </ToggleButton>
  );
}
