import { app } from "electron";
import path from "path";
import Store from "electron-store";
import { IConfig } from "src/interfaces/config";
import { baseUrl, network } from "src/main/config";

export const configStore = new Store<IConfig>({});
export const DEFAULT_NETWORK = "main";
export const CONFIG_FILENAME = "config.json";
export const INSTALLER_NAME = "NineChroniclesInstaller.exe";
export const DOWNLOAD_BASE_URL = "https://release.nine-chronicles.com";
export const PLANET_REGISTRY = "https://planets.nine-chronicles.com";

export const REQUIRED_DISK_SPACE = 20n * 1000n * 1000n * 1000n;
export const TRANSIFEX_TOKEN = "1/9ac6d0a1efcda679e72e470221e71f4b0497f7ab";

export const REMOTE_CONFIG_URL = `${baseUrl}/${network()}/${CONFIG_FILENAME}`;
export const INSTALLER_URL = path.join(baseUrl, INSTALLER_NAME);

export const CONFIG_FILE_PATH = path.join(
  app.getPath("userData"),
  CONFIG_FILENAME,
);
export const PLAYER_INSTALL_PATH = path.join(
  app.getPath("userData"),
  `player/${network}`,
);

export const MAC_GAME_PATH = path.join(
  PLAYER_INSTALL_PATH,
  "NineChronicles.app/Contents/MacOS/NineChronicles",
);
export const WIN_GAME_PATH = path.join(
  PLAYER_INSTALL_PATH,
  "NineChronicles.exe",
);
export const LINUX_GAME_PATH = path.join(PLAYER_INSTALL_PATH, "NineChronicles");

export const EXECUTE_PATH: {
  [k in NodeJS.Platform]: string | null;
} = {
  aix: null,
  android: null,
  darwin: MAC_GAME_PATH,
  freebsd: null,
  haiku: null,
  linux: LINUX_GAME_PATH,
  openbsd: null,
  sunos: null,
  win32: WIN_GAME_PATH,
  cygwin: WIN_GAME_PATH,
  netbsd: null,
};
