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

const getLocalApplicationDataPath = (): string => {
  if (process.platform === "darwin") {
    return path.join(app.getPath("home"), ".local", "share");
  }
  return path.join(app.getPath("home"), "AppData", "Local");
};

export const blockchainStoreDirParent =
  get("BlockchainStoreDirParent") === ""
    ? path.join(getLocalApplicationDataPath(), "planetarium")
    : get("BlockchainStoreDirParent");

export function getBlockChainStorePath(): string {
  return path.join(blockchainStoreDirParent, get("BlockchainStoreDirName"));
}
