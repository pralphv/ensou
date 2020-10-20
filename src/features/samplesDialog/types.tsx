import * as types from "types";

export interface ISamplesDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
  sampleApi: types.IMidiFunctions["sampleApi"];
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
}
