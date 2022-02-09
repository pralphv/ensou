import { Sampler } from "tone";

export type onSampleDownloadStartType = Function;
export type onSampleDownloadingType = (progress: number) => void;
export type onApplyingSamplesType = (progress: number) => void;
export type onAppliedSamplesType = Function;
export type onActivateType = (samplers: Sampler[]) => void;

export interface ISampleEventsMap {
    "onSampleDownloadStart"?: onSampleDownloadStartType;
    "onSampleDownloading"?: onSampleDownloadingType;
    "onApplyingSamples"?: onApplyingSamplesType;
    "onAppliedSamples"?: onAppliedSamplesType;
    "onActivate"?: onActivateType;
}
