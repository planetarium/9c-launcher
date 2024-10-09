import Store from "electron-store";
import { IConfig } from "/@/types/config";

export const configStore = new Store<IConfig>();

export const network = () => {
  const network = configStore.get("Network", DEFAULT_NETWORK);
  if (network === "9c-main") {
    return "main";
  }
  return network;
};

export const DEFAULT_NETWORK = 'main';
export const CONFIG_FILENAME = 'config.json';
export const CONFIG_URL = 'https://release.nine-chronicles.com';
export const PLANET_REGISTRY = 'https://planets.nine-chronicles.com'; // TODO fetch planet registry URL from config
