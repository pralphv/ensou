import React from "react";

import DialogContent from "@material-ui/core/DialogContent";
import grey from "@material-ui/core/colors/grey";
import Grid from "@material-ui/core/Grid";

import * as types from "types";
import ToMasterCheckbox from "./ToMasterCheckBox";
import ExtraOutput from "./ExtraOutput";
import EffectParams from "./EffectParams";
import EffectSelector from "./EffectSelector";
import AddButton from "../../addButton/AddButton";
import ActivateSwitch from "./ActivateSwitch";
import RemoveButton from "features/removeButton/RemoveButton";
import myMidiPlayer from "audio";

interface IEffectsTab {
  forceLocalRender: types.forceLocalRender;
}

export default function EffectsTab({
  forceLocalRender,
}: IEffectsTab): JSX.Element {
  const myTonejs = myMidiPlayer.myTonejs;
  return (
    <div>
      {myTonejs && (
        <DialogContent>
          <div style={{ padding: 16 }}>
            <ActivateSwitch
              checked={myTonejs.getEffectsActivated()}
              onChange={() => {
                myTonejs?.toggleEffectsActivated();
                forceLocalRender();
              }}
            />
            <Grid
              container
              spacing={2}
              direction="row"
              justify="center"
              alignItems="stretch"
            >
              {myTonejs.getEffectsChain().map((fx, fxIndex) => {
                const effectName = fx.name as types.AvailableEffectsNames;
                return (
                  <Grid
                    key={`${fxIndex}`}
                    item
                    style={{
                      background: grey[900],
                      padding: 16,
                      width: "160px",
                    }}
                  >
                    <EffectSelector
                      value={effectName}
                      onChange={(e: any) => {
                        myTonejs.changeFx(
                          fxIndex,
                          e.target.value as types.AvailableEffectsNames
                        );
                        forceLocalRender();
                      }}
                    />
                    <EffectParams
                      effectName={effectName}
                      fx={fx}
                      fxIndex={fxIndex}
                      forceLocalRender={forceLocalRender}
                    />
                    <ExtraOutput
                      fxIndex={fxIndex}
                      noOfTracks={myTonejs.getEffectsChain().length}
                      value={myTonejs.getExtraConnection(fxIndex).effectorIndex}
                      onChange={(e: any) => {
                        myTonejs.changeExtraConnection(
                          fxIndex,
                          "effectorIndex",
                          e.target.value
                        );
                        forceLocalRender();
                      }}
                    />
                    <ToMasterCheckbox
                      checked={myTonejs.getExtraConnection(fxIndex).toMaster}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        myTonejs.changeExtraConnection(
                          fxIndex,
                          "toMaster",
                          e.target.checked
                        );
                        forceLocalRender();
                      }}
                    />
                    <RemoveButton
                      onClick={() => {
                        myTonejs.removeFx(fxIndex);
                        forceLocalRender();
                      }}
                    />
                  </Grid>
                );
              })}
              <AddButton
                onClick={() => {
                  myTonejs.addFx();
                  forceLocalRender();
                }}
              />
            </Grid>
          </div>
        </DialogContent>
      )}
    </div>
  );
}
