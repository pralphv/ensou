import { set, get, keys } from "idb-keyval";
import { ArrayBufferMap } from "types";

export enum IndexedDbKeys {
  local = "local",
  online = "online",
  recorded = "recorded",
}

function buildKey(source: IndexedDbKeys, filename: string) {
  return `${source}_${filename}`;
}

export async function getSample(
  source: IndexedDbKeys,
  filename: string
): Promise<ArrayBufferMap> {
  const key = buildKey(source, filename);
  return await get(key);
}

export async function setSample(
  source: IndexedDbKeys,
  filename: string,
  arrayBufferMap: ArrayBufferMap
) {
  const key = buildKey(source, filename);
  await set(key, arrayBufferMap);
}

export async function getDownloadedServerSamplers(): Promise<string[]> {
  const downloadedSamplers = await keys();
  return downloadedSamplers.filter(
    (name) => name.toString().substring(0, 6) === IndexedDbKeys.online
  ) as string[];
}
