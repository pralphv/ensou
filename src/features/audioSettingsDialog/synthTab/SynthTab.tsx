import React from "react";

import grey from "@mui/material/colors/grey";
import Grid from "@mui/material/Grid";
import DialogContent from "@mui/material/DialogContent";
import * as types from "types";
import DelaySlider from "../DelaySlider";
import myMidiPlayer from "audio";

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
        {myMidiPlayer.myTonejs &&
          range(myMidiPlayer.myTonejs?.polySynths.length).map((i) => (
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
                <DelaySlider
                  forceLocalRender={forceLocalRender}
                  synthIndex={i}
                />
                <OtherSettings
                  forceLocalRender={forceLocalRender}
                  synthIndex={i}
                />
                <RemoveButton
                  onClick={() => {
                    myMidiPlayer.myTonejs?.removeInstrument(i);
                    forceLocalRender();
                  }}
                />
              </Grid>
            </div>
          ))}
        <AddButton
          onClick={() => {
            myMidiPlayer.myTonejs?.addInstrument();
            forceLocalRender();
          }}
        />
      </Grid>
    </DialogContent>
  );
}
