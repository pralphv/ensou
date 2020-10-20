import React, { useEffect, useState } from "react";

import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { SamplerOptions } from "tone";
import * as localTypes from "./types";
import { AvailableSynthsEnum } from "types";

export default function EffectsTab({
  setOpen,
  samplerSourceApi,
  forceRerender,
}: any) {
// }: localTypes.ISynthTab) {
  const availableValues = Object.keys(AvailableSynthsEnum);
  return (
    <div>
      <DialogContent>
        <DialogContentText>
            Coming soon!
        </DialogContentText>
      </DialogContent>
    </div>
  );
}
