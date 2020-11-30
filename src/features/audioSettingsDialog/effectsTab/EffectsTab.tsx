import React from "react";

import DialogContent from "@material-ui/core/DialogContent";
import grey from "@material-ui/core/colors/grey";
import Grid from "@material-ui/core/Grid";

import * as types from "types";
import ToMasterCheckbox from "./ToMasterCheckBox";
import ExtraOutput from "./ExtraOutput";
import EffectParams from "./EffectParams";
import EffectSelector from "./EffectSelector";
import AddFxButton from "./AddFxButton";
import RemoveFxButton from "./RemoveFxButton";
import ActivateSwitch from "./ActivateSwitch";
import MyMidiPlayer from "audio/midiPlayer";

interface IEffectsTab {
  forceRerender: types.forceRerender;
  midiPlayer: MyMidiPlayer;
  forceLocalRender: types.forceLocalRender;
}

export default function EffectsTab({
  forceRerender,
  midiPlayer,
  forceLocalRender,
}: IEffectsTab): JSX.Element {
  const myTonejs = midiPlayer.myTonejs;
  return (
    <div>
      {myTonejs && (
        <DialogContent>
          <div style={{ background: grey[900], padding: 16 }}>
            <ActivateSwitch
              checked={myTonejs.getEffectsActivated()}
              onChange={() => {
                midiPlayer.myTonejs?.toggleEffectsActivated();
                forceLocalRender();
              }}
            />
            {myTonejs.getEffectsChain().map((tracks, trackIndex) => (
              <div key={trackIndex}>
                <Grid
                  container
                  spacing={2}
                  direction="row"
                  justify="center"
                  alignItems="center"
                >
                  {tracks.map((fx, fxIndex) => {
                    const effectName = fx.name as types.AvailableEffectsNames;
                    return (
                      <Grid
                        key={`${trackIndex}${fxIndex}`}
                        item
                        style={{ background: grey[800], padding: 16 }}
                      >
                        <EffectSelector
                          value={effectName}
                          onChange={(e: any) => {
                            myTonejs.changeFx(
                              trackIndex,
                              fxIndex,
                              e.target.value as types.AvailableEffectsNames
                            );
                            forceLocalRender();
                          }}
                        />
                        <EffectParams
                          midiPlayer={midiPlayer}
                          effectName={effectName}
                          fx={fx}
                          trackIndex={trackIndex}
                          fxIndex={fxIndex}
                          forceLocalRender={forceLocalRender}
                          changeFxSettings={myTonejs.changeFxSettings}
                        />
                        <ExtraOutput
                          trackIndex={trackIndex}
                          fxIndex={fxIndex}
                          noOfTracks={tracks.length}
                          value={
                            myTonejs.getExtraConnection(trackIndex, fxIndex)
                              .effectorIndex
                          }
                          onChange={(e: any) => {
                            myTonejs.changeExtraConnection(
                              trackIndex,
                              fxIndex,
                              "effectorIndex",
                              e.target.value
                            );
                            forceLocalRender();
                          }}
                        />
                        <ToMasterCheckbox
                          checked={
                            myTonejs.getExtraConnection(trackIndex, fxIndex)
                              .toMaster
                          }
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            myTonejs.changeExtraConnection(
                              trackIndex,
                              fxIndex,
                              "toMaster",
                              e.target.checked
                            );
                            forceLocalRender();
                          }}
                        />
                        <RemoveFxButton
                          onClick={() => {
                            myTonejs.removeFx(trackIndex, fxIndex);
                            forceLocalRender();
                          }}
                        />
                      </Grid>
                    );
                  })}
                  <Grid item>
                    <AddFxButton
                      onClick={() => {
                        myTonejs.addFx(trackIndex);
                        forceLocalRender();
                      }}
                    />
                  </Grid>
                </Grid>
              </div>
            ))}
          </div>
        </DialogContent>
      )}
    </div>
  );
}
