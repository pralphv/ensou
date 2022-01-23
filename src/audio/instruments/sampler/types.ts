import { Sampler } from "tone";

export type onSampleDownloadStartType = Function;
export type onSampleDownloadingType = (progress: number) => void;
export type onApplyingSamplesType = Function;
export type onActivateType = (samplers: Sampler[]) => void;

export interface ISampleEventsMap {
    "onSampleDownloadStart"?: onSampleDownloadStartType;
    "onSampleDownloading"?: onSampleDownloadingType;
    "onApplyingSamples"?: onApplyingSamplesType;
    "onActivate"?: onActivateType;
}
