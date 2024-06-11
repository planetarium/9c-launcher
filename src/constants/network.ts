import Store from "electron-store";
import { IConfig } from "../interfaces/config";

export const configStore = new Store<IConfig>();

export const network = () => {
  const network = configStore.get("Network", DEFAULT_NETWORK);
  if (network === "9c-main") {
    return "main";
  }
  return network;
};

export const DEFAULT_NETWORK = "main";
export const CONFIG_FILENAME = "config.json";
export const baseUrl = configStore.get(
  "DownloadBaseURL",
  "https://release.nine-chronicles.com",
);
export const PLANET_REGISTRY = "https://planets.nine-chronicles.com"; // TODO fetch planet registry URL from config
export const REMOTE_CONFIG_URL = `${baseUrl}/${network()}/${CONFIG_FILENAME}`;
