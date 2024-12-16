import axios from "axios";
import {
  configStore,
  get as getConfig,
  playerPath,
  netenv,
  baseUrl,
  CONFIG_FILE_PATH,
  initializeNode,
  NodeInfo,
} from "../config";
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  dialog,
  shell,
} from "electron";
import { NotSupportedPlatformError } from "src/main/exceptions/not-supported-platform";
import { PLATFORM2OS_MAP } from "src/utils/os";
import path from "path";
import fs from "fs";
import { ChildProcessWithoutNullStreams, spawn, exec } from "child_process";
import logoImage from "./resources/logo.png";
import "core-js";
import log from "electron-log";
import * as utils from "src/utils";
import { IGameStartOptions } from "../interfaces/ipc";
import { v4 as uuidv4 } from "uuid";
import { Client as NTPClient } from "ntp-time";
import { IConfig } from "src/interfaces/config";
import {
  createWindow as createV2Window,
  setQuitting as setV2Quitting,
} from "./application";
import fg from "fast-glob";
import {
  performPlayerUpdate,
  cleanUpLockfile,
  isUpdating,
} from "./update/player-update";
import { IUpdateOptions } from "./update/types";
import AppUpdater from "./update/updater";
import { send } from "./ipc";
import { IPC_OPEN_URL } from "src/renderer/ipcTokens";
import {
  initialize as remoteInitialize,
  enable as webEnable,
} from "@electron/remote/main";
import { fork } from "child_process";
import { Planet } from "src/interfaces/registry";

Object.assign(console, log.functions);

const REMOTE_CONFIG_URL = `${baseUrl}/${netenv}/config.json`;

let win: BrowserWindow | null = null;
let appUpdaterInstance: AppUpdater | null = null;
let tray: Tray;
let isMessageBoxOpen = false;
let isQuiting: boolean = false;
let gameNode: ChildProcessWithoutNullStreams | null = null;

const client = new NTPClient("time.google.com", 123, { timeout: 5000 });

let registry: Planet[];
let remoteNode: NodeInfo;
let geoBlock: { ip: string; country: string; isWhitelist?: boolean };

const useUpdate = getConfig("UseUpdate", process.env.NODE_ENV === "production");

const updateOptions: IUpdateOptions = {
  downloadStarted: quitAllProcesses,
};

client
  .syncTime()
  .then((time) => {
    const timeFromNTP = new Date(time.receiveTimestamp);
    const computerTime = new Date();
    const delta = Math.abs(timeFromNTP.getTime() - computerTime.getTime());

    if (delta > 15000) {
      dialog.showErrorBox(
        "Computer Time Incorrect",
        "The current computer time is incorrect. Please sync your computer's time correctly.",
      );
    }
  })
  .catch((error) => {
    console.error(error);
  });

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const lastArgv = argv[argv.length - 1];
    if (lastArgv.startsWith("ninechronicles-launcher://") && win)
      send(win, IPC_OPEN_URL, lastArgv);
    win?.show();
  });

  app.on("open-url", (_, url) => win && send(win, IPC_OPEN_URL, url));

  cleanUp();

  if (process.platform === "darwin" && process.arch == "arm64") {
    exec("/usr/bin/arch -arch x86_64 uname -m", (error) => {
      if (error) {
        console.log("ARM64: Rosetta Not Installed, Try Installation...");
        utils.execute("/usr/sbin/softwareupdate", [
          "--install-rosetta",
          "--agree-to-license",
        ]);
      } else {
        console.log("ARM64: Rosetta Installed, Skip Installation...");
      }
    });
  }

  initializeConfig();
  initializeApp();
  initializeIpc();
}

async function initializeConfig() {
  try {
    const res = await axios(REMOTE_CONFIG_URL);
    const remoteConfig: IConfig = res.data;

    const exists = await fs.promises.stat(CONFIG_FILE_PATH).catch(() => false);

    if (!exists) {
      console.log(
        "Remote not exists, Replace config with remote config:",
        remoteConfig,
      );
      configStore.store = remoteConfig;
    }
    console.log("planetary registry initialization.");
    remoteConfig.Planet = getConfig("Planet", "0x000000000000");
    remoteConfig.PlanetRegistryUrl = getConfig(
      "PlanetRegistryUrl",
      "https://planets.nine-chronicles.com/planets/",
    );

    const data = await fetch(remoteConfig.PlanetRegistryUrl);

    registry = await data.json();
    if (registry === undefined) throw Error("Failed to parse registry.");
    if (!Array.isArray(registry) || registry.length <= 0) {
      throw Error("Registry is empty or invalid. No planets found.");
    }

    const planet =
      registry.find((v) => v.id === remoteConfig.Planet) ??
      (() => {
        console.log(
          "No matching PlanetID found in registry. Using the first planet.",
        );
        remoteConfig.Planet = registry[0].id;
        return registry[0];
      })();

    remoteNode = await initializeNode(planet.rpcEndpoints, true);
    console.log(registry);

    const localConfigVersion = getConfig("ConfigVersion");
    const remoteConfigVersion = remoteConfig.ConfigVersion;
    if (localConfigVersion > remoteConfigVersion) {
      console.log(
        `Local config is newer than remote, ignore. (local: ${localConfigVersion}, remote: ${remoteConfigVersion})`,
      );
      return;
    }

    // Replace config
    console.log("Replace config with remote config:", remoteConfig);
    remoteConfig.Locale = getConfig("Locale");
    remoteConfig.PlayerUpdateRetryCount = getConfig(
      "PlayerUpdateRetryCount",
      0,
    );
    remoteConfig.TrayOnClose = getConfig("TrayOnClose", true);

    configStore.store = remoteConfig;
    console.log("Initialize config complete");
  } catch (error) {
    console.error(
      `An unexpected error occurred during fetching remote config. ${error}`,
    );
  }

  log.transports.file.maxSize = getConfig("LogSizeBytes");
}

async function initializeApp() {
  console.log("initializeApp");

  const isProtocolSet = app.setAsDefaultProtocolClient(
    "ninechronicles-launcher",
    process.execPath,
    [!app.isPackaged && path.resolve(process.argv[1]), "--protocol"].filter(
      Boolean,
    ),
  );
  console.log("isProtocolSet", isProtocolSet);

  app.on("ready", async () => {
    remoteInitialize();

    win = await createV2Window();
    await initGeoBlocking();

    process.on("uncaughtException", async (error) => {
      if (error.message.includes("system error -86")) {
        console.error("System error -86 error occurred:", error);

        if (win) {
          await dialog
            .showMessageBox(win, {
              type: "error",
              title: "Execution Error",
              message: "Unable to run due to missing Rosetta.",
              detail:
                'Please install Rosetta to execute the application. Click "OK" to view the guide.',
              buttons: ["OK", "Cancel"],
            })
            .then((response) => {
              if (response.response === 0) {
                shell.openExternal(
                  "https://planetarium.notion.site/How-to-Install-Rosetta-on-Your-Mac-32e8e50f35ee49f3b0a9686a3267160d?pvs=4",
                );
              }

              isQuiting = true;
              setV2Quitting(true);
              app.quit();
            });
        }
      } else {
        console.error("An uncaught error occurred:", error);
        throw error;
      }
    });

    setV2Quitting(!getConfig("TrayOnClose"));

    if (useUpdate) {
      appUpdaterInstance = new AppUpdater(win, baseUrl, updateOptions);
      initCheckForUpdateWorker(win, appUpdaterInstance);
    }

    webEnable(win.webContents);
    createTray(path.join(app.getAppPath(), logoImage));

    if (app.commandLine.hasSwitch("protocol"))
      send(win!, IPC_OPEN_URL, process.argv[process.argv.length - 1]);
  });

  app.on("quit", (event) => {
    quitAllProcesses();
  });

  app.on("activate", async (event) => {
    event.preventDefault();
    win?.show();
  });
}

function initializeIpc() {
  ipcMain.on("launch game", (_, info: IGameStartOptions) => {
    if (gameNode !== null) {
      console.error("Game is already running.");
      return;
    }

    if (isUpdating()) {
      console.error("Cannot launch game while updater is running.");
      return;
    }

    if (utils.getExecutePath() === "PLAYER_UPDATE") {
      configStore.set(
        // Update Retry Counter
        "PlayerUpdateRetryCount",
        configStore.get("PlayerUpdateRetryCount") + 1,
      );
      return manualPlayerUpdate();
    }

    const node = utils.execute(utils.getExecutePath(), info.args);
    if (node !== null) {
      configStore.set("PlayerUpdateRetryCount", 0);
    }
    node.on("close", (code) => {
      // Code 21: ERROR_NOT_READY
      if (code === 21) {
        relaunch();
      }
      win?.webContents.send("game closed");
      win?.show();
    });
    node.on("exit", (code) => {
      win?.webContents.send("game closed");
      win?.show();
      gameNode = null;
    });
    gameNode = node;
  });

  ipcMain.on("min", () => win?.minimize());
  ipcMain.on("max", () => win?.maximize());
  ipcMain.on("close", () => win?.close());

  ipcMain.handle("execute launcher update", async (event) => {
    if (appUpdaterInstance === null) throw Error("appUpdaterInstance is null");
    setV2Quitting(true);
    configStore.set("PlayerUpdateRetryCount", 0);
    await appUpdaterInstance.execute();
  });

  ipcMain.on("select-directory", async (event) => {
    if (win === null) throw Error("BrowserWindow is null");
    const directory = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    });
    if (directory.canceled) {
      event.returnValue = null;
    } else {
      event.returnValue = directory.filePaths;
    }
  });

  ipcMain.on("online-status-changed", (event, status: "online" | "offline") => {
    console.log(`online-status-changed: ${status}`);
    if (status === "offline") {
      relaunch();
    }
  });

  ipcMain.handle("get-planetary-info", async () => {
    while (!registry || !remoteNode) {
      await utils.sleep(100);
    }
    return [registry, remoteNode];
  });

  ipcMain.handle("check-geoblock", async () => {
    while (!geoBlock) {
      await utils.sleep(100);
    }
    return geoBlock;
  });

  ipcMain.on("all-rpc-failed", (event) => {
    if (isMessageBoxOpen) return;
    isMessageBoxOpen = true;

    event?.preventDefault();
    console.error("All RPC Failed to respond.");
    dialog
      .showMessageBox(win!, {
        message: "Failed to connect remote node. please restart launcher.",
        type: "error",
        buttons: ["Retry", "Exit"],
        defaultId: 0,
        cancelId: 1,
      })
      .then((result) => {
        isMessageBoxOpen = false;
        if (result.response === 0) {
          console.log("RPC Reconnect Attempted");
          event.returnValue = true;
        } else {
          console.log("Closing.");
          app.exit();
        }
      });
  });

  ipcMain.handle("manual player update", async () => {
    console.log("MANUAL PLAYER UPDATE TRIGGERED");
    manualPlayerUpdate();
  });
}
/**
 * Clean up the byproducts from the previous runs at the start of the program.
 */
function cleanUp() {
  cleanUpLockfile();
}

async function quitAllProcesses(reason: string = "default") {
  if (gameNode === null) return;
  const pid = gameNode.pid!;
  process.kill(pid, "SIGINT");
  gameNode = null;
}

function createTray(iconPath: string) {
  let trayIcon = nativeImage.createFromPath(iconPath);
  trayIcon = trayIcon.resize({
    width: 16,
    height: 16,
  });
  tray = new Tray(trayIcon);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Open Window",
        click: function () {
          win?.show();
        },
      },
      {
        label: "Restart Launcher",
        click: function () {
          relaunch();
        },
      },
      {
        label: "Quit Launcher",
        click: function () {
          isQuiting = true;
          setV2Quitting(true);
          app.quit();
        },
      },
    ]),
  );
  tray.on("click", function () {
    win?.show();
  });
  return tray;
}

function relaunch() {
  app.relaunch();
  app.exit();
}

function initCheckForUpdateWorker(
  win: BrowserWindow,
  appUpdaterInstance: AppUpdater,
) {
  interface Message {
    type: string;
    [key: string]: any;
  }

  const os = PLATFORM2OS_MAP[process.platform];
  const publishedStorageBaseUrl = `${baseUrl}/${netenv}`;

  if (os == null) {
    throw new NotSupportedPlatformError(process.platform);
  }

  const checkForUpdateWorker = fork(
    path.join(__dirname, "./checkForUpdateWorker.js"),
    [],
    {
      env: {
        ELECTRON_RUN_AS_NODE: "1",
        playerPath,
        os,
        baseUrl: publishedStorageBaseUrl,
      },
    },
  );

  checkForUpdateWorker.on("message", (message: Message) => {
    if (message.type === "player update") {
      console.log("Encountered player update", message);
      performPlayerUpdate(win, message.path, message.size, updateOptions);
    }
    if (message.type === "launcher update") {
      appUpdaterInstance.checkForUpdate();
    }
    if (message.type === "log") {
      console[message.level as "debug" | "error" | "log"](
        "[checkForUpdateWorker] " + message.body,
      );
    }
  });

  checkForUpdateWorker.on("error", (error) => {
    console.error("Error in child process:", error);
  });

  checkForUpdateWorker.on("exit", (code) => {
    console.log(`Child process exited with code ${code}`);
  });
}

async function manualPlayerUpdate() {
  const targetOS = PLATFORM2OS_MAP[process.platform];
  const updateUrl = `${baseUrl}/${netenv}/player`;
  try {
    const updateData: {
      files: { path: string; size: number; os: string }[];
    } = await (await fetch(`${updateUrl}/latest.json`)).json();
    for (const file of updateData.files) {
      if (file.os === targetOS) {
        performPlayerUpdate(
          win!,
          `${updateUrl}/${file.path}`,
          file.size,
          updateOptions,
        );
      }
    }
  } catch (e) {
    console.error("Manual Player Update Failed:", e);
  }
}

async function initGeoBlocking() {
  try {
    const response = await fetch(
      "https://country-checker.nine-chronicles.com/",
    );
    geoBlock = await response.json();

    return geoBlock.country;
  } catch (error) {
    console.error("Failed to fetch geo data:", error);
    win?.webContents
      .executeJavaScript('localStorage.getItem("country")')
      .then((result) => {
        geoBlock.isWhitelist = false;
        if (result == null) {
          geoBlock.country = "KR";
        } else geoBlock.country = result;
      });
  }
}
