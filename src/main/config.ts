import Store from "electron-store";
import path from "path";
import { IConfig } from "../interfaces/config";
import { DEFAULT_NETWORK, DOWNLOAD_BASE_URL } from "./constants";

export const configStore = new Store<IConfig>();

export const network = () => {
  const network = configStore.get("Network", DEFAULT_NETWORK);
  if (network === "9c-main") {
    return "main";
  }
  return network;
};

export const baseUrl = configStore.get("DownloadBaseURL", DOWNLOAD_BASE_URL);

export function get<K extends keyof IConfig>(
  key: K,
  defaultValue?: Required<IConfig>[K],
): IConfig[K] {
  if (configStore.has(key)) {
    return configStore.get(key);
  }

  // @ts-expect-error - The overload doesn't work well with optional arguments.
  return configStore.get(key, defaultValue);
}
