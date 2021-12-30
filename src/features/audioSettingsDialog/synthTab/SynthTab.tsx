import React from "react";

import grey from "@mui/material/colors/grey";
import Grid from "@mui/material/Grid";
import DialogContent from "@mui/material/DialogContent";
import * as types from "types";
import DelaySlider from "../DelaySlider";
import instruments from "audio/instruments";

import EnvelopeSettings from "./EnvelopeSettings";
import OscillatorSettings from "./OscillatorSettings";
import OtherSettings from "../OtherSettings";
import SynthesizerSettings from "./SynthesizerSettings";
import AddButton from "features/addButton/AddButton";
import RemoveButton from "features/removeButton/RemoveButton";
import { range } from "lodash";

export interface ISynthTab {
  forceLocalRender: types.forceLocalRender;
}

export default function SynthTab({ forceLocalRender }: ISynthTab) {
  return (
    <DialogContent>
      <Grid
        container
        gap={2}
        direction="row"
        justifyContent="center"
        alignItems="stretch"
      >
        {range(instruments.myPolySynth.polySynths.length).map((i) => (
          <div key={i}>
            <Grid
              item
              sx={{
                width: "160px",
              }}
            >
              <SynthesizerSettings
                forceLocalRender={forceLocalRender}
                synthIndex={i}
              />
              <EnvelopeSettings
                forceLocalRender={forceLocalRender}
                synthIndex={i}
              />
              <OscillatorSettings
                forceLocalRender={forceLocalRender}
                synthIndex={i}
              />
              <DelaySlider forceLocalRender={forceLocalRender} synthIndex={i} />
              <OtherSettings
                forceLocalRender={forceLocalRender}
                synthIndex={i}
              />
              <RemoveButton
                onClick={() => {
                  instruments.myPolySynth.remove(i);
                  forceLocalRender();
                }}
              />
            </Grid>
          </div>
        ))}
        <AddButton
          onClick={() => {
            instruments.myPolySynth.add();
            forceLocalRender();
          }}
        />
      </Grid>
    </DialogContent>
  );
}
