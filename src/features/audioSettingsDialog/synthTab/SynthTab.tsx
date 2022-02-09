import React from "react";

import Grid from "@mui/material/Grid";
import DialogContent from "@mui/material/DialogContent";
import * as types from "types";
// import DelaySlider from "../DelaySlider";
import instruments from "audio/instruments";
import myMidiPlayer from "audio";

import EnvelopeSettings from "./EnvelopeSettings";
import OscillatorSettings from "./OscillatorSettings";
// import OtherSettings from "../OtherSettings";
import SynthesizerSettings from "./SynthesizerSettings";
import AddButton from "features/addButton/AddButton";
import RemoveButton from "features/removeButton/RemoveButton";
import { range } from "lodash";

export interface ISynthTab {
  requireRender: Function;
}

export default function SynthTab({ requireRender }: ISynthTab) {
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
                requireRender={requireRender}
                synthIndex={i}
              />
              <EnvelopeSettings requireRender={requireRender} synthIndex={i} />
              <OscillatorSettings
                requireRender={requireRender}
                synthIndex={i}
              />
              <RemoveButton
                onClick={() => {
                  instruments.myPolySynth.remove(i);
                  requireRender();
                }}
              />
            </Grid>
          </div>
        ))}
        <AddButton
          onClick={() => {
            myMidiPlayer.addSynth();
            requireRender();
          }}
        />
      </Grid>
    </DialogContent>
  );
}
