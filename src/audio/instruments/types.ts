import { Sampler, PolySynth } from "tone";

export interface ISampleEventsMap {
    "onSampleDownloadStart": Function;
    "onSampleDownloading": (progress: number) => void;
    "onApplyingSamples": Function;
}
