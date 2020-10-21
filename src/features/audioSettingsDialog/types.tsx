import * as types from "types";

export interface IAudioSettingsDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
  sampleApi: types.IMidiFunctions["sampleApi"];
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  isSampler: boolean;
}

export interface ISynthTab {
  setOpen: (bool: boolean) => void;
  sampleApi: types.IMidiFunctions["sampleApi"];
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  audioSettingsApi: types.IMidiFunctions["audioSettingsApi"];
  forceLocalRender: () => void;
}
