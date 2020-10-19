import { set, get, keys } from "idb-keyval";
import { ArrayBufferMap } from "types";

enum IndexedDbKeys {
  local = "local",
}

export async function setServerSampler(
  key: string,
  arrayBufferMap: ArrayBufferMap
) {
  await set(key, arrayBufferMap);
}

export async function getServerSampler(key: string): Promise<ArrayBufferMap> {
  return await get(key);
}

export async function getDownloadedServerSamplers(): Promise<string[]> {
  const downloadedSamplers = await keys();
  return downloadedSamplers.filter((name) => name !== IndexedDbKeys.local) as string[];
}

export async function setLocalSamplerArrayBuffer(sampleMap: ArrayBufferMap) {
  await set(IndexedDbKeys.local, sampleMap);
}

export async function getLocalSamplerArrayBuffer(): Promise<ArrayBufferMap> {
  return await get(IndexedDbKeys.local);
}
