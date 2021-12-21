import * as types from "types";
import { fetchInstruments } from "./fetch";
import { Sampler } from "tone";
import * as instrumentTypes from "../types";

export async function get(
  instrument: types.Instrument,
  sample: string,
  onSampleDownloadStart: instrumentTypes.onSampleDownloadStart,
  onSampleDownloading: instrumentTypes.onSampleDownloading,
  onApplyingSamples: instrumentTypes.onApplyingSamples
) {
  const sampleMap = await fetchInstruments(
    instrument,
    sample,
    onSampleDownloadStart,
    onSampleDownloading,
    onApplyingSamples
  );
  // throw new Error("CRITICAL: no sample map provided.");
  let sampler = new Sampler(sampleMap, {
    attack: 0.01,
  });
  // this._setPlayerStatus("");
  return sampler;
}
