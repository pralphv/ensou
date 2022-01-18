export type onSampleDownloadStartType = Function;
export type onSampleDownloadingType = (progress: number) => void;
export type onApplyingSamplesType = Function;

export interface ISampleEventsMap {
    "onSampleDownloadStart"?: onSampleDownloadStartType;
    "onSampleDownloading"?: onSampleDownloadingType;
    "onApplyingSamples"?: onApplyingSamplesType;
}
