export interface ISampleEventsMap {
    "onSampleDownloadStart"?: Function;
    "onSampleDownloading"?: (progress: number) => void;
    "onApplyingSamples"?: Function;
}
