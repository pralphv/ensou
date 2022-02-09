import { FeedbackDelay } from "tone";
import * as types from "types";

export function initDelay(settings?: types.IDelaySettings) {
  if (!settings) {
  }
  const delay = new FeedbackDelay(settings?.delayTime, settings?.feedback, );
  return delay;
}
