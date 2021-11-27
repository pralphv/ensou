import React from "react";

import DialogContent from "@mui/material/DialogContent";
import grey from "@mui/material/colors/grey";
import Grid from "@mui/material/Grid";

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
    <React.Fragment>
      {myTonejs && (
        <DialogContent>
          <React.Fragment>
            <ActivateSwitch
              checked={myTonejs.getEffectsActivated()}
              onChange={() => {
                myTonejs?.toggleEffectsActivated();
                forceLocalRender();
              }}
            />
            <Grid
              container
              gap={2}
              direction="row"
              justifyContent="center"
              alignItems="stretch"
            >
              {myTonejs.getEffectsChain().map((fx, fxIndex) => {
                const effectName = fx.name as types.AvailableEffectsNames;
                return (
                  <Grid
                    key={`${fxIndex}`}
                    item
                    sx={{
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
          </React.Fragment>
        </DialogContent>
      )}
    </React.Fragment>
  );
}
