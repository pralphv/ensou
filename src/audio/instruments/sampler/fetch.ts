import * as types from "types";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { storageRef } from "firebaseApi/firebase";
import { convertArrayBufferToAudioContext } from "utils/helper";
import { ISampleCache } from "../../types";
import { onSampleDownloadStartType, onSampleDownloadingType, onApplyingSamplesType} from "./types";

// let SAMPLE_CACH: ISampleCache = {};

/**
 * This function fetches from firebase, then saves to local indexDb as cache.
 */