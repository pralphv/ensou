import React from "react";

import DialogContent from "@material-ui/core/DialogContent";
import grey from "@material-ui/core/colors/grey";
import Grid from "@material-ui/core/Grid";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import ToMasterCheckbox from "./ToMasterCheckBox";
import ExtraOutput from "./ExtraOutput";
import EffectParams from "./EffectParams";
import EffectHeader from "./EffectHeader";
import EffectSelector from "./EffectSelector";
import AddFxButton from "./AddFxButton";
import AddInstrumentButton from "./AddInstrumentButton";

interface IEffectsTab {
  forceRerender: types.forceRerender;
  trackFxApi: types.IMidiFunctions["trackFxApi"];
  forceLocalRender: types.forceLocalRender;
}

export default function EffectsTab({
  forceRerender,
  trackFxApi,
  forceLocalRender,
}: IEffectsTab): JSX.Element {
  const trackFx = trackFxApi.getEffectsChain();

  return (
    <DialogContent>
      <div style={{ background: grey[900], padding: 16 }}>
        {trackFx.map((tracks, trackIndex) => (
          <div key={trackIndex}>
            {/* <EffectHeader
              trackIndex={trackIndex}
              onClick={() => {
                trackFxApi.removeInstrument(trackIndex);
                forceLocalRender();
              }}
            /> */}
            <Grid
              container
              spacing={2}
              direction="row"
              justify="center"
              alignItems="center"
            >
              {tracks.map((fx, fxIndex) => {
                const effectName = fx.constructor
                  .name as types.AvailableEffectsNames;
                return (
                  <Grid
                    key={`${trackIndex}${fxIndex}`}
                    item
                    style={{ background: grey[800], padding: 16 }}
                  >
                    <EffectSelector
                      value={effectName}
                      onChange={(e: any) => {
                        trackFxApi.changeFx(
                          trackIndex,
                          fxIndex,
                          e.target.value as types.AvailableEffectsNames
                        );
                        forceLocalRender();
                      }}
                    />
                    <EffectParams
                      effectName={effectName}
                      fx={fx}
                      trackIndex={trackIndex}
                      fxIndex={fxIndex}
                      forceLocalRender={forceLocalRender}
                      changeFxSettings={trackFxApi.changeFxSettings}
                    />
                    <ExtraOutput
                      trackIndex={trackIndex}
                      fxIndex={fxIndex}
                      noOfTracks={tracks.length}
                      value={
                        trackFxApi.getExtraConnection(trackIndex, fxIndex)
                          .effectorIndex
                      }
                      onChange={(e: any) => {
                        trackFxApi.changeExtraConnection(
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
                        trackFxApi.getExtraConnection(trackIndex, fxIndex)
                          .toMaster
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        trackFxApi.changeExtraConnection(
                          trackIndex,
                          fxIndex,
                          "toMaster",
                          e.target.checked
                        );
                        forceLocalRender();
                      }}
                    />
                  </Grid>
                );
              })}
              <Grid item>
                <AddFxButton
                  onClick={() => {
                    trackFxApi.addFx(trackIndex);
                    forceLocalRender();
                  }}
                />
              </Grid>
            </Grid>
          </div>
        ))}
      </div>
      {/* <AddInstrumentButton
        addInstrument={trackFxApi.addInstrument}
        forceLocalRender={forceLocalRender}
      /> */}
    </DialogContent>
  );
}
