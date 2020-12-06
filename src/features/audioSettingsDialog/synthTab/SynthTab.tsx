import React from "react";

import grey from "@material-ui/core/colors/grey";
import Grid from "@material-ui/core/Grid";
import DialogContent from "@material-ui/core/DialogContent";
import * as types from "types";
import DelaySlider from "../DelaySlider";
import MyMidiPlayer from "audio/midiPlayer";

import EnvelopeSettings from "./EnvelopeSettings";
import OscillatorSettings from "./OscillatorSettings";
import OtherSettings from "../OtherSettings";
import SynthesizerSettings from "./SynthesizerSettings";
import AddButton from "features/addButton/AddButton";
import RemoveButton from "features/removeButton/RemoveButton";
import { range } from "lodash";
export interface ISynthTab {
  midiPlayer: MyMidiPlayer;
  forceRerender: types.forceRerender;
  forceLocalRender: types.forceLocalRender;
}

export default function SynthTab({
  midiPlayer,
  forceRerender,
  forceLocalRender,
}: ISynthTab) {
  return (
    <DialogContent>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="stretch"
      >
        {midiPlayer.myTonejs &&
          range(midiPlayer.myTonejs?.polySynths.length).map((i) => (
            <div key={i}>
              <Grid
                item
                style={{
                  background: grey[900],
                  padding: 16,
                  width: "160px",
                }}
              >
                <SynthesizerSettings
                  midiPlayer={midiPlayer}
                  forceLocalRender={forceLocalRender}
                  synthIndex={i}
                />
                <EnvelopeSettings
                  midiPlayer={midiPlayer}
                  forceLocalRender={forceLocalRender}
                  synthIndex={i}
                />
                <OscillatorSettings
                  midiPlayer={midiPlayer}
                  forceLocalRender={forceLocalRender}
                  synthIndex={i}
                />
                <DelaySlider
                  midiPlayer={midiPlayer}
                  forceLocalRender={forceLocalRender}
                  synthIndex={i}
                />
                <OtherSettings
                  midiPlayer={midiPlayer}
                  forceLocalRender={forceLocalRender}
                  synthIndex={i}
                />
                <RemoveButton
                  onClick={() => {
                    midiPlayer.myTonejs?.removeInstrument(i);
                    forceLocalRender();
                  }}
                />
              </Grid>
            </div>
          ))}
        <AddButton
          onClick={() => {
            midiPlayer.myTonejs?.addInstrument();
            forceLocalRender();
          }}
        />
      </Grid>
    </DialogContent>
  );
}
