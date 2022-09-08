import axios from "axios";
import {
  DEFAULT_DOWNLOAD_BASE_URL,
  CUSTOM_SERVER,
  LOCAL_SERVER_HOST,
  LOCAL_SERVER_PORT,
  configStore,
  get as getConfig,
  getBlockChainStorePath,
  WIN_GAME_PATH,
  EXECUTE_PATH,
  RPC_SERVER_HOST,
  RPC_SERVER_PORT,
  MIXPANEL_TOKEN,
  initializeNode,
  NodeInfo,
  userConfigStore,
  netenv,
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
import { enable as remoteEnable } from "@electron/remote/main";
import path from "path";
import fs from "fs";
import { ChildProcessWithoutNullStreams } from "child_process";
import logoImage from "./resources/logo.png";
import { initializeSentry } from "../preload/sentry";
import "core-js";
import log from "electron-log";
import { AppProtocolVersionType } from "../generated/graphql";
import { decodeApvExtra } from "../utils/apv";
import * as utils from "../utils";
import * as partitionSnapshot from "./snapshot";
import * as monoSnapshot from "./monosnapshot";
import Headless from "./headless/headless";
import {
  HeadlessExitedError,
  HeadlessInitializeError,
  UndefinedProtectedPrivateKeyError,
} from "../main/exceptions";
import CancellationToken from "cancellationtoken";
import { IGameStartOptions } from "../interfaces/ipc";
import { init as createMixpanel } from "mixpanel";
import { v4 as ipv4 } from "public-ip";
import { v4 as uuidv4 } from "uuid";
import { Address, PrivateKey } from "./headless/key-store";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import { ClearCacheException } from "./exceptions/clear-cache-exception";
import createCollectionWindow from "../collection/window";
import { Client as NTPClient } from "ntp-time";
import { IConfig } from "src/interfaces/config";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  MOBX_DEVTOOLS,
  APOLLO_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import bytes from "bytes";
import createTransferWindow from "../transfer/window";
import RemoteHeadless from "./headless/remoteHeadless";
import { NineChroniclesMixpanel } from "./mixpanel";
import {
  createWindow as createV2Window,
  setQuitting as setV2Quitting,
} from "./v2/application";
import { getFreeSpace } from "@planetarium/check-free-space";
import fg from "fast-glob";
import {
  cleanUpLockfile,
  isUpdating,
  IUpdateOptions,
} from "./update/launcher-update";
import { update } from "./update/update";
import {
  checkUpdateRequired,
  checkUpdateRequiredUsedPeersApv,
} from "./update/check";
import { send } from "./v2/ipc";
import {
  IPC_OPEN_URL,
  IPC_PRELOAD_IDLE,
  IPC_PRELOAD_NEXT,
} from "../v2/ipcTokens";
import {
  initialize as remoteInitialize,
  enable as webEnable,
} from "@electron/remote/main";

initializeSentry();

Object.assign(console, log.functions);

const standaloneExecutablePath = path.join(
  app.getAppPath(),
  "publish",
  "NineChronicles.Headless.Executable"
);

const baseURL = getConfig("DownloadBaseURL", DEFAULT_DOWNLOAD_BASE_URL);
const REMOTE_CONFIG_URL = `${baseURL}/9c-launcher-config.json`;

let win: BrowserWindow | null = null;
let collectionWin: BrowserWindow | null = null;
let tray: Tray;
let isQuiting: boolean = false;
let gameNode: ChildProcessWithoutNullStreams | null = null;
const standalone: Headless = new Headless(standaloneExecutablePath);
let ip: string | null = null;
let relaunched: boolean = false;

let bootstrapped = false;

let initializeHeadlessCts: {
  cancel: (reason?: any) => void;
  token: CancellationToken;
} | null = null;
const client = new NTPClient("time.google.com", 123, { timeout: 5000 });

let remoteHeadless: RemoteHeadless;
let useRemoteHeadless: boolean;
let remoteNode: NodeInfo;

const isV2 =
  !getConfig("PreferLegacyInterface") || app.commandLine.hasSwitch("v2");
const useUpdate = getConfig("UseUpdate", process.env.NODE_ENV === "production");

ipv4().then((value) => (ip = value));

const mixpanelUUID = loadInstallerMixpanelUUID();
const mixpanel: NineChroniclesMixpanel | undefined =
  getConfig("Mixpanel") && process.env.NODE_ENV === "production"
    ? new NineChroniclesMixpanel(createMixpanel(MIXPANEL_TOKEN), mixpanelUUID)
    : undefined;

const updateOptions: IUpdateOptions = {
  downloadStarted: quitAllProcesses,
  relaunchRequired: relaunch,
  getWindow: () => win,
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
        "The current computer time is incorrect. Please sync your computer's time correctly."
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

  let quitTracked = false;
  app.on("before-quit", (event) => {
    if (mixpanel != null && !quitTracked) {
      event.preventDefault();
      mixpanel?.track("Launcher/Quit", undefined, () => {
        quitTracked = true;
        app.quit();
      });
    }
  });

  cleanUp();

  // intializeConfig();
  useRemoteHeadless = getConfig("UseRemoteHeadless");
  initializeApp();
  initializeIpc();
}

async function intializeConfig() {
  try {
    const res = await axios(REMOTE_CONFIG_URL);
    const remoteConfig: IConfig = res.data;

    const localApv = getConfig("AppProtocolVersion");
    const remoteApv = remoteConfig.AppProtocolVersion;
    if (localApv !== remoteApv) {
      console.log(
        `APVs are different, ignore. (local: ${localApv}, remote: ${remoteApv})`
      );
      return;
    }

    const localConfigVersion = getConfig("ConfigVersion");
    const remoteConfigVersion = remoteConfig.ConfigVersion;
    if (localConfigVersion > remoteConfigVersion) {
      console.log(
        `Local config is newer than remote, ignore. (local: ${localConfigVersion}, remote: ${remoteConfigVersion})`
      );
      return;
    }

    // Replace config
    console.log("Replace config with remote config:", remoteConfig);
    configStore.store = remoteConfig;
  } catch (error) {
    console.error(
      `An unexpected error occurred during fetching remote config. ${error}`
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
      Boolean
    )
  );
  console.log("isProtocolSet", isProtocolSet);

  app.on("ready", async () => {
    remoteInitialize();
    if (process.env.NODE_ENV !== "production")
      await installExtension([
        REACT_DEVELOPER_TOOLS,
        MOBX_DEVTOOLS,
        APOLLO_DEVELOPER_TOOLS,
      ])
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log("An error occurred: ", err));

    if (isV2) win = await createV2Window();
    else win = await createWindow();
    webEnable(win.webContents);
    createTray(path.join(app.getAppPath(), logoImage));

    const context = await checkUpdateRequired(
      standalone,
      process.platform,
      netenv,
      getConfig("PeerStrings"),
      baseURL,
      getConfig("AppProtocolVersion"),
      getConfig("TrustedAppProtocolVersionSigners")
    );

    if (context && !isV2) update(context, updateOptions);
    else if (context && isV2)
      ipcMain.handle("start update", async () => {
        await update(context, updateOptions);
      });

    if (app.commandLine.hasSwitch("protocol"))
      send(win!, IPC_OPEN_URL, process.argv[process.argv.length - 1]);

    mixpanel?.track("Launcher/Start", {
      isV2,
      useRemoteHeadless,
      updateAvailable: !!context,
    });

    try {
      remoteNode = await initializeNode();
    } catch (e) {
      console.error(e);
      const { checkboxChecked } = await dialog.showMessageBox(win!, {
        message: "Failed to connect remote node. please restart launcher.",
        type: "error",
        checkboxLabel: "Disable RPC mode",
      }); // TODO Replace with "go to error page" event
      if (checkboxChecked) userConfigStore.set("UseRemoteHeadless", false);

      app.exit();
    }

    // Detects and move old snapshot caches as they're unused.
    // Ignores any failure as they're not critical.
    fg("snapshot-*", { cwd: app.getPath("userData") }).then((files) =>
      Promise.allSettled(files.map((file) => fs.promises.unlink(file)))
    );

    if (useRemoteHeadless) {
      console.log("main initializeApp call initializeRemoteHeadless");
      initializeRemoteHeadless();
    } else {
      initializeHeadless();
    }
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
  ipcMain.on(
    "encounter different version",
    async (_event, apv: Pick<AppProtocolVersionType, "version" | "extra">) => {
      if (useUpdate) {
        const decodedExtra = apv.extra && decodeApvExtra(apv.extra);

        const simpleApv = {
          version: apv.version,
          extra: decodedExtra ? Object.fromEntries(decodedExtra) : {},
        };

        const context = await checkUpdateRequiredUsedPeersApv(
          simpleApv,
          standalone,
          process.platform,
          netenv,
          baseURL,
          getConfig("AppProtocolVersion")
        );
        await update(context, updateOptions);
      }
    }
  );

  ipcMain.handle("open collection page", async (_, selectedAddress) => {
    if (collectionWin != null) {
      collectionWin.focus();
      return;
    }
    console.log(`open collection page address: ${selectedAddress}`);
    collectionWin = await createCollectionWindow();
    console.log(
      `call initialize collection window: ${selectedAddress}, ${remoteNode.HeadlessUrl()}`
    );
    collectionWin!.webContents.send(
      "initialize collection window",
      selectedAddress,
      remoteNode!.HeadlessUrl()
    );
    collectionWin.on("close", function (event: any) {
      collectionWin = null;
    });
  });

  ipcMain.handle("open transfer page", async (_, selectedAddress) => {
    if (collectionWin != null) {
      collectionWin.focus();
      return;
    }
    console.log(`open transfer page address: ${selectedAddress}`);
    collectionWin = await createTransferWindow();
    console.log(
      `call initialize transfer window: ${selectedAddress}, ${remoteNode.HeadlessUrl()}`
    );
    collectionWin!.webContents.send(
      "initialize transfer window",
      selectedAddress,
      remoteNode!.HeadlessUrl()
    );
    collectionWin.on("close", function (event: any) {
      collectionWin = null;
    });
  });

  ipcMain.on("launch game", (_, info: IGameStartOptions) => {
    if (gameNode !== null) {
      console.error("Game is already running.");
      return;
    }

    if (isUpdating()) {
      console.error("Cannot launch game while updater is running.");
      return;
    }

    const node = utils.execute(
      EXECUTE_PATH[process.platform] || WIN_GAME_PATH,
      info.args
    );

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

  ipcMain.handle("clear cache", async (event, rerun: boolean) => {
    console.log(`Clear cache is requested. (rerun: ${rerun})`);
    mixpanel?.track("Launcher/Clear Cache");
    await quitAllProcesses("clear-cache");
    utils.deleteBlockchainStoreSync(getBlockChainStorePath());
    if (rerun) {
      if (useRemoteHeadless) {
        console.log("main clear cache call initializeRemoteHeadless");
        await initializeRemoteHeadless();
      } else {
        await initializeHeadless();
      }
    }
    return true;
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

  ipcMain.on("login", async () => {
    mixpanel?.login();
  });

  ipcMain.on("set mining", async () => {
    mixpanel?.miningConfig();
  });

  ipcMain.on("relaunch standalone", async (event, param: object) => {
    mixpanel?.track("Launcher/Relaunch Headless", {
      relaunched,
      ...param,
    });
    await relaunchHeadless();
    relaunched = true;
    event.returnValue = true;
  });

  ipcMain.on("get-aws-sink-cloudwatch-guid", async (event) => {
    const localAppData = process.env.localappdata;
    if (process.platform === "win32" && localAppData !== undefined) {
      const guidPath = path.join(
        localAppData,
        "planetarium",
        ".aws_sink_cloudwatch_guid"
      );

      if (fs.existsSync(guidPath)) {
        event.returnValue = await fs.promises.readFile(guidPath, {
          encoding: "utf-8",
        });
      } else {
        event.returnValue = null;
      }

      return;
    }

    event.returnValue = "Not supported platform.";
  });

  ipcMain.on(
    "mixpanel-track-event",
    async (_, eventName: string, param: object) => {
      mixpanel?.track(eventName, {
        ...param,
      });
    }
  );

  ipcMain.on("mixpanel-alias", async (_, alias: string) => {
    mixpanel?.alias(alias);
  });

  ipcMain.handle("get-protected-private-keys", async () =>
    standalone.keyStore.list()
  );

  ipcMain.on(
    "unprotect-private-key",
    async (event, address: Address, passphrase: string) => {
      try {
        const protectedPrivateKey = standalone.keyStore
          .list()
          .find((x) => x.address === address);
        if (protectedPrivateKey === undefined) {
          event.returnValue = [
            undefined,
            new UndefinedProtectedPrivateKeyError(
              "ProtectedPrivateKey is undefined during unprotect private key."
            ),
          ];
          return;
        }

        event.returnValue = [
          standalone.keyStore.unprotectPrivateKey(
            protectedPrivateKey.keyId,
            passphrase
          ),
          undefined,
        ];
      } catch (error) {
        event.returnValue = [undefined, error];
      }
    }
  );

  ipcMain.on("create-private-key", async (event, passphrase: string) => {
    event.returnValue =
      standalone.keyStore.createProtectedPrivateKey(passphrase);
  });

  ipcMain.handle("generate-private-key", async (event) => {
    return standalone.keyStore.generateRawKey();
  });

  ipcMain.on(
    "import-private-key",
    async (event, privateKey: PrivateKey, passphrase: string) => {
      event.returnValue = standalone.keyStore.importPrivateKey(
        privateKey,
        passphrase
      );
    }
  );

  ipcMain.on(
    "revoke-protected-private-key",
    async (event, address: Address) => {
      const keyList = standalone.keyStore.list();
      keyList.forEach((pv) => {
        if (pv.address.replace("0x", "") === address.toString()) {
          standalone.keyStore.revokeProtectedPrivateKey(pv.keyId);
        }
      });

      event.returnValue = ["", undefined];
    }
  );

  ipcMain.on("validate-private-key", async (event, privateKeyHex: string) => {
    event.returnValue = standalone.validation.isValidPrivateKey(privateKeyHex);
  });

  ipcMain.on(
    "convert-private-key-to-address",
    async (event, privateKeyHex: string) => {
      event.returnValue = standalone.keyStore.convertPrivateKey(
        privateKeyHex,
        "address"
      );
    }
  );

  ipcMain.on("online-status-changed", (event, status: "online" | "offline") => {
    console.log(`online-status-changed: ${status}`);
    if (status === "offline") {
      relaunch();
    }
  });

  ipcMain.handle("get-node-info", async () => {
    while (!remoteNode) {
      await utils.sleep(100);
    }
    return remoteNode;
  });

  ipcMain.handle("is bootstrapped", () => bootstrapped);
}

async function initializeHeadless(): Promise<void> {
  /*
  1. Check disk (permission, storage).
  2. Check APV and update if needed.
  3. If use snapshot, download metadata.
  4. Validate metadata via headless-command.
  5. If metadata is valid, download snapshot with parallel.
  6. Extract downloaded snapshot.
  7. Execute headless.
  */
  console.log(`Initialize headless. (win: ${win?.getTitle})`);

  if (initializeHeadlessCts !== null) {
    console.error("Cannot initialize headless while initializing headless.");
    return;
  }

  if (standalone.alive) {
    console.error("Cannot initialize headless while headless is running.");
    return;
  }

  if (isUpdating()) {
    console.error("Cannot initialize headless while updater is running.");
    return;
  }

  initializeHeadlessCts = CancellationToken.create();

  try {
    const chainPath = getBlockChainStorePath();
    if (!utils.isDiskPermissionValid(chainPath)) {
      win?.webContents.send("go to error page", "no-permission");
      throw new HeadlessInitializeError(`Not enough permission. ${chainPath}`);
    }

    win?.webContents.send("start bootstrap");
    bootstrapped = true;
    const snapshot =
      getConfig("StoreType") === "rocksdb" ? partitionSnapshot : monoSnapshot;

    const snapshotPaths: string[] = getConfig("SnapshotPaths");
    if (CUSTOM_SERVER) {
      console.log(
        "As a custom headless server is used, snapshot won't be used."
      );
    } else if (snapshotPaths.length > 0 && win != null) {
      const snapshotDownloadUrls: string[] = getConfig("SnapshotPaths");
      let isProcessSuccess = false;
      let recentError: Error = Error();
      const cacheFolder = path.join(
        getConfig("BlockchainStoreDirParent"),
        "temp"
      );
      if (!fs.existsSync(cacheFolder)) await fs.promises.mkdir(cacheFolder);
      for (const snapshotDownloadUrl of snapshotDownloadUrls) {
        try {
          isProcessSuccess = await snapshot.processSnapshot(
            snapshotDownloadUrl,
            chainPath,
            cacheFolder,
            standalone,
            win,
            initializeHeadlessCts.token,
            async (size) => {
              try {
                const freeSpace = await getFreeSpace(chainPath);
                if (freeSpace < size) {
                  win?.webContents.send("go to error page", "disk-space", {
                    size,
                  });
                  throw new HeadlessInitializeError(
                    `Not enough space. ${chainPath} (${freeSpace} < ${size})`
                  );
                }
              } catch (e) {
                console.error("Error while checking free space:", e);
                await dialog.showMessageBox(win!, {
                  message: `Failed to check free space. Please make sure you have at least ${bytes(
                    Number(size)
                  )} available on your disk.`,
                  type: "warning",
                });
              }
            },
            mixpanel
          );

          if (isProcessSuccess) break;
        } catch (error) {
          recentError = error;
        }
      }

      if (!isProcessSuccess) {
        console.log(recentError.message);
        switch (recentError.constructor) {
          case DownloadSnapshotFailedError:
            win?.webContents.send(
              "go to error page",
              "download-snapshot-failed-error"
            );
            throw new HeadlessInitializeError(
              `Snapshot download failed.`,
              recentError
            );
          case DownloadSnapshotMetadataFailedError:
            win?.webContents.send(
              "go to error page",
              "download-snapshot-metadata-failed-error"
            );
            throw new HeadlessInitializeError(
              `Snapshot metadata download failed.`,
              recentError
            );
          case ClearCacheException:
            // do nothing when clearing cache
            return;
          default:
            win?.webContents.send(
              "go to error page",
              "download-snapshot-failed-error"
            );
            throw new HeadlessInitializeError(
              `Unexpected Error occupied when download snapshot.`,
              recentError
            );
        }
      }
    }

    initializeHeadlessCts.token.throwIfCancelled();
    send(win!, IPC_PRELOAD_NEXT);
    win?.webContents.send("start headless");
    await standalone.execute(getHeadlessArgs());

    console.log("Register exit handler.");
    standalone.once("exit", async () => {
      console.error("Headless exited by self.");
      send(win!, IPC_PRELOAD_IDLE);
      await relaunchHeadless();
    });
  } catch (error) {
    console.error(`Error occurred during initializeHeadless(). ${error}`);
    if (
      error instanceof HeadlessInitializeError ||
      error instanceof CancellationToken.CancellationError
    ) {
      console.error(`InitializeHeadless() halted: ${error}`);
    } else if (error instanceof HeadlessExitedError) {
      console.error("Headless exited during initialization:", error);
      win?.webContents.send("go to error page", "clear-cache");
    } else {
      win?.webContents.send("go to error page", "reinstall");
      throw error;
    }
  } finally {
    console.log("initializeHeadless() finished.");
    initializeHeadlessCts = null;
  }
}

async function initializeRemoteHeadless(): Promise<void> {
  /*
  1. Check APV and update if needed.
  2. Execute remote headless.
  */
  console.log(`Initialize remote headless. (win: ${win?.getTitle})`);

  if (initializeHeadlessCts !== null) {
    console.error(
      "Cannot initialize remote headless while initializing headless."
    );
    return;
  }

  if (standalone.alive) {
    console.error(
      "Cannot initialize remote headless while headless is running."
    );
    return;
  }

  if (isUpdating()) {
    console.error(
      "Cannot initialize remote headless while updater is running."
    );
    return;
  }

  initializeHeadlessCts = CancellationToken.create();

  try {
    initializeHeadlessCts.token.throwIfCancelled();
    win?.webContents.send("start remote headless");
    // console.log("main call remote_node");
    remoteHeadless = new RemoteHeadless(remoteNode!);
    await remoteHeadless.execute();

    console.log("Register exit handler.");
    standalone.once("exit", async () => {
      console.error("remote headless exited by self.");
      await relaunchHeadless();
    });
  } catch (error) {
    console.error(
      `Error occurred during initialize remote headless(). ${error}`
    );
    if (
      error instanceof HeadlessInitializeError ||
      error instanceof CancellationToken.CancellationError
    ) {
      console.error(`Initialize remote headless() halted: ${error}`);
    } else if (error instanceof HeadlessExitedError) {
      console.error("remote headless exited during initialization:", error);
      win?.webContents.send("go to error page", "clear-cache");
    } else {
      win?.webContents.send("go to error page", "reinstall");
      throw error;
    }
  } finally {
    console.log("initialize remote headless() finished.");
    initializeHeadlessCts = null;
  }
}

async function createWindow(): Promise<BrowserWindow> {
  const _win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), "preload.js"),
    },
    frame: true,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });
  remoteEnable(_win.webContents);

  _win.setResizable(false); // see: https://github.com/electron/electron/issues/19565#issuecomment-867283465

  console.log(app.getAppPath());

  if (process.env.NODE_ENV !== "production") {
    await _win.loadURL("http://localhost:9000");
    await _win.webContents.openDevTools();
  } else {
    _win.loadFile("index.html");
  }

  _win.on("close", function (event: any) {
    if (!isQuiting) {
      event.preventDefault();
      _win?.hide();
    }
  });

  _win.webContents.on("new-window", function (event: any, url: string) {
    event.preventDefault();
    shell.openExternal(url);
  });

  return _win;
}

/**
 * Clean up the byproducts from the previous runs at the start of the program.
 */
function cleanUp() {
  cleanUpAfterUpdate();
  cleanUpLockfile();
}

function cleanUpAfterUpdate() {
  const executable = app.getPath("exe");
  const basename = path.basename(executable);
  const dirname = path.dirname(executable);
  const bakExecutable = path.join(dirname, "bak_" + basename);

  if (fs.existsSync(bakExecutable)) {
    console.log(
      "The result from updating process, ",
      bakExecutable,
      ", was found."
    );
    fs.unlinkSync(bakExecutable);
    console.log("Removed ", bakExecutable);
  }
}

function loadInstallerMixpanelUUID(): string {
  const planetariumPath =
    process.platform === "win32"
      ? path.join(process.env.LOCALAPPDATA as string, "planetarium")
      : app.getPath("userData");
  if (!fs.existsSync(planetariumPath)) {
    fs.mkdirSync(planetariumPath, {
      recursive: true,
    });
  }

  const guidPath = path.join(planetariumPath, ".installer_mixpanel_uuid");

  if (!fs.existsSync(guidPath)) {
    const newUUID = uuidv4();
    console.log(`The installer mixpanel UUID doesn't exist at '${guidPath}'.`);
    fs.writeFileSync(guidPath, newUUID);
    console.log(`Created new UUID ${newUUID} and stored.`);
    return newUUID;
  } else {
    return fs.readFileSync(guidPath, {
      encoding: "utf-8",
    });
  }
}

async function relaunchHeadless(reason: string = "default") {
  await stopHeadlessProcess(reason);
  if (useRemoteHeadless) {
    console.log("main relaunchHeadless call initializeRemoteHeadless");
    await initializeRemoteHeadless();
  } else {
    await initializeHeadless();
  }
}

async function quitAllProcesses(reason: string = "default") {
  await stopHeadlessProcess(reason);
  if (gameNode === null) return;
  const pid = gameNode.pid;
  process.kill(pid, "SIGINT");
  gameNode = null;
}

async function stopHeadlessProcess(reason: string = "default"): Promise<void> {
  console.log("Cancelling initializeHeadless()");
  initializeHeadlessCts?.cancel(reason);
  while (initializeHeadlessCts !== null) await utils.sleep(100);
  console.log("initializeHeadless() cancelled.");
  await standalone.kill();
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
    ])
  );
  tray.on("click", function () {
    win?.show();
  });
  return tray;
}

function relaunch() {
  if (mixpanel !== undefined) {
    mixpanel.track("Launcher/Relaunch", undefined, () => {
      app.relaunch();
      app.exit();
    });
  } else {
    app.relaunch();
    app.exit();
  }
}

function getHeadlessArgs(): string[] {
  const args = [
    `-V=${getConfig("AppProtocolVersion")}`,
    `-G=${getConfig("GenesisBlockPath")}`,
    `--store-type=${getConfig("StoreType")}`,
    `--store-path=${getBlockChainStorePath()}`,
    ...getConfig("IceServerStrings").map(
      (iceServerString) => `-I=${iceServerString}`
    ),
    ...getConfig("PeerStrings").map((peerString) => `--peer=${peerString}`),
    ...getConfig("TrustedAppProtocolVersionSigners").map(
      (trustedAppProtocolVersionSigner) =>
        `-T=${trustedAppProtocolVersionSigner}`
    ),
    "--no-miner",
    "--rpc-server",
    `--rpc-listen-host=${RPC_SERVER_HOST}`,
    `--rpc-listen-port=${RPC_SERVER_PORT}`,
    "--graphql-server",
    `--graphql-host=${LOCAL_SERVER_HOST}`,
    `--graphql-port=${LOCAL_SERVER_PORT}`,
    `--workers=${getConfig("Workers")}`,
    `--confirmations=${getConfig("Confirmations")}`,
    ...getConfig("HeadlessArgs", []),
    ...(process.env.NODE_ENV !== "production" ? ["--no-cors"] : []),
  ];

  {
    const awsAccessKey = getConfig("AwsAccessKey");
    const awsSecretKey = getConfig("AwsSecretKey");
    const awsRegion = getConfig("AwsRegion");

    if (
      awsAccessKey !== undefined &&
      awsSecretKey !== undefined &&
      awsRegion !== undefined
    ) {
      args.push(
        `--aws-access-key=${awsAccessKey}`,
        `--aws-secret-key=${awsSecretKey}`,
        `--aws-region=${awsRegion}`
      );
    }
  }

  return args;
}
