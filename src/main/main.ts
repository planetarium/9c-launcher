import axios from "axios";
import {
  CUSTOM_SERVER,
  LOCAL_SERVER_HOST,
  LOCAL_SERVER_PORT,
  configStore,
  get as getConfig,
  getBlockChainStorePath,
  MAC_GAME_PATH,
  WIN_GAME_PATH,
  RPC_SERVER_HOST,
  RPC_SERVER_PORT,
  REQUIRED_DISK_SPACE,
  MIXPANEL_TOKEN,
} from "../config";
import isDev from "electron-is-dev";
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  DownloadItem,
  dialog,
  shell,
} from "electron";
import { spawn as spawnPromise } from "child-process-promise";
import path from "path";
import fs from "fs";
import { ChildProcessWithoutNullStreams } from "child_process";
import { download, Options as ElectronDLOptions } from "electron-dl";
import logoImage from "./resources/logo.png";
import { initializeSentry } from "../preload/sentry";
import "core-js";
import extractZip from "extract-zip";
import log from "electron-log";
import { DifferentAppProtocolVersionEncounterSubscription } from "../generated/graphql";
import { BencodexDict, encode, decode } from "bencodex";
import { tmpName } from "tmp-promise";
import lockfile from "lockfile";
import * as utils from "../utils";
import * as partitionSnapshot from "./snapshot";
import * as monoSnapshot from "./monosnapshot";
import Headless from "./headless/headless";
import {
  HeadlessExitedError,
  HeadlessInitializeError,
  UndefinedProtectedPrivateKeyError,
} from "../errors";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress, IGameStartOptions } from "../interfaces/ipc";
import { init as createMixpanel, Mixpanel } from "mixpanel";
import { v4 as ipv4 } from "public-ip";
import { v4 as uuidv4 } from "uuid";
import { DownloadBinaryFailedError } from "./exceptions/download-binary-failed";
import { Address, PrivateKey } from "./headless/key-store";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import { ClearCacheException } from "./exceptions/clear-cache-exception";
import createCollectionWindow from "../collection/window";
import { Client as NTPClient } from "ntp-time";
import { IConfig } from "src/interfaces/config";
import installExtension, { REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS } from 'electron-devtools-installer';
import RemoteHeadless from "./headless/remoteHeadless";

initializeSentry();

log.transports.file.maxSize = 1024 * 1024 * 15;
Object.assign(console, log.functions);

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");
const standaloneExecutablePath = path.join(
  app.getAppPath(),
  "publish",
  "NineChronicles.Headless.Executable"
);

const REMOTE_CONFIG_URL = "https://download.nine-chronicles.com/9c-launcher-config.json";

let win: BrowserWindow | null = null;
let collectionWin: BrowserWindow | null = null;
let tray: Tray;
let isQuiting: boolean = false;
let gameNode: ChildProcessWithoutNullStreams | null = null;
let standalone: Headless = new Headless(standaloneExecutablePath);
let remoteHeadless: RemoteHeadless;
let ip: string | null = null;
const mixpanelUUID = loadInstallerMixpanelUUID();
const mixpanel: Mixpanel | null =
  getConfig("Mixpanel") && !isDev
    ? createMixpanel(MIXPANEL_TOKEN)
    : null;
let useRemoteHeadless: boolean = false;
let initializeHeadlessCts: {
  cancel: (reason?: any) => void;
  token: CancellationToken;
} | null = null;
const client = new NTPClient("time.google.com", 123, { timeout: 5000 });

export type MixpanelInfo = {
  mixpanel: Mixpanel | null;
  mixpanelUUID: string;
  ip: string | null;
};

ipv4().then((value) => (ip = value));

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
  app.on("second-instance", (_event, _commandLine) => {
    win?.show();
  });

  let quitTracked = false;
  app.on("before-quit", (event) => {
    if (mixpanel !== null && !quitTracked) {
      event.preventDefault();
      mixpanel?.track(
        "Launcher/Quit",
        {
          distinct_id: mixpanelUUID,
          ip,
        },
        () => {
          quitTracked = true;
          app.quit();
        }
      );
    }
  });

  cleanUp();

  initializeConfig();
  useRemoteHeadless = configStore.get("UseRemoteHeadless");
  initializeApp();
  initializeIpc();
}

async function initializeConfig() {
  try {
    const res = await axios(REMOTE_CONFIG_URL);
    const remoteConfig: IConfig = res.data;

    const localApv = getConfig("AppProtocolVersion");
    const remoteApv = remoteConfig.AppProtocolVersion;
    if (localApv !== remoteApv) {
      console.log(`APVs are different, ignore. (local: ${localApv}, remote: ${remoteApv})`);
      return;
    }

    const localConfigVersion = getConfig("ConfigVersion");
    const remoteConfigVersion = remoteConfig.ConfigVersion;
    if (localConfigVersion > remoteConfigVersion) {
      console.log(`Local config is newer than remote, ignore. (local: ${localConfigVersion}, remote: ${remoteConfigVersion})`);
      return;
    }

    // Replace config
    configStore.store = remoteConfig;
  }
  catch (error) {
    console.error(`An unexpected error occurred during fetching remote config. ${error}`);
  }
}

function initializeApp() {
  app.on("ready", () => {
    win = createWindow();
    createTray(path.join(app.getAppPath(), logoImage));
    win.webContents.on("dom-ready", (event) => {
      if (useRemoteHeadless)
      {
        initializeRemoteHeadless();
      }
      else
      {
        initializeHeadless();
      }
    });

    if(isDev) installExtension([REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS])
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
  });

  app.on("quit", (event) => {
    quitAllProcesses();
  });

  app.on("activate", (event) => {
    event.preventDefault();
    win?.show();
  });
}

function initializeIpc() {

  ipcMain.handle("open collection page", async () => {
    if (collectionWin != null) {
      collectionWin.focus();
      return;
    }
    collectionWin = createCollectionWindow();
    collectionWin.on("close", function (event: any) {
      collectionWin = null;
    });
  });

  ipcMain.on("launch game", (_, info: IGameStartOptions) => {
    if (gameNode !== null) {
      console.error("Game is already running.");
      return;
    }

    if (lockfile.checkSync(lockfilePath)) {
      console.error(
        "Cannot launch game while updater is running.\n",
        lockfilePath
      );
      return;
    }

    const node = utils.execute(
      path.join(
        app.getAppPath(),
        process.platform === "darwin" ? MAC_GAME_PATH : WIN_GAME_PATH
      ),
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

  ipcMain.on("clear cache", async (event, rerun: boolean) => {
    console.log(`Clear cache is requested. (rerun: ${rerun})`);
    mixpanel?.track(
      "Launcher/Clear Cache",
      { distinct_id: mixpanelUUID, ip });
    await quitAllProcesses("clear-cache");
    utils.deleteBlockchainStoreSync(getBlockChainStorePath());
    if (rerun) {
      if (useRemoteHeadless)
      {
        initializeRemoteHeadless();
      }
      else {
        initializeHeadless();
      }
    }
    event.returnValue = true;
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

  ipcMain.on("relaunch standalone", async (event) => {
    await relaunchHeadless();
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

  ipcMain.on("mixpanel-track-event", async (_, eventName: string) => {
    mixpanel?.track(eventName, {
      distinct_id: mixpanelUUID,
      ip,
    });
  });

  ipcMain.on("mixpanel-alias", async (_, alias: string) => {
    mixpanel?.alias(mixpanelUUID, alias);
  });

  ipcMain.on("get-protected-private-keys", async (event) => {
    event.returnValue = standalone.keyStore.list();
  });

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
    event.returnValue = standalone.keyStore.createProtectedPrivateKey(
      passphrase
    );
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

  if (lockfile.checkSync(lockfilePath)) {
    console.error(
      "Cannot initialize headless while updater is running.\n",
      lockfilePath
    );
    return;
  }

  const peerInfos: string[] = getConfig("PeerStrings");
  if (peerInfos.length > 0) {
    const peerApvToken = standalone.apv.query(peerInfos[0]);
    if (peerApvToken !== null) {
      if (
        standalone.apv.verify(
          getConfig("TrustedAppProtocolVersionSigners"),
          peerApvToken
        )
      ) {
        const peerApv = standalone.apv.analyze(peerApvToken);
        const localApvToken = getConfig("AppProtocolVersion");
        const localApv = standalone.apv.analyze(localApvToken);
      } else {
        console.log(
          `Ignore APV[${peerApvToken}] due to failure to validating.`
        );
      }
    }
  }

  initializeHeadlessCts = CancellationToken.create();

  const mixpanelInfo: MixpanelInfo = {
    mixpanel: mixpanel,
    mixpanelUUID: mixpanelUUID,
    ip: ip,
  };

  try {
    const chainPath = getBlockChainStorePath();
    if (!utils.isDiskPermissionValid(chainPath)) {
      win?.webContents.send("go to error page", "no-permission");
      throw new HeadlessInitializeError(
        `Not enough permission. ${chainPath}`
      );
    }

    let freeSpace = await utils.getDiskSpace(chainPath);
    if (freeSpace < REQUIRED_DISK_SPACE) {
      win?.webContents.send("go to error page", "disk-space");
      throw new HeadlessInitializeError(
        `Not enough space. ${chainPath} (${freeSpace} < ${REQUIRED_DISK_SPACE})`
      );
    }
    win?.webContents.send("start bootstrap");
    const snapshot =
      getConfig("StoreType") === "rocksdb"
        ? partitionSnapshot
        : monoSnapshot;

    const snapshotPaths: string[] = getConfig("SnapshotPaths");
    if (CUSTOM_SERVER) {
      console.log(
        "As a custom headless server is used, snapshot won't be used."
      );
    } else if (snapshotPaths.length > 0 && win != null) {
      const snapshotDownloadUrls: string[] = getConfig("SnapshotPaths");
      let isProcessSuccess = false;
      let recentError: Error = Error();
      for (const snapshotDownloadUrl of snapshotDownloadUrls) {
        try {
          isProcessSuccess = await snapshot.processSnapshot(
            snapshotDownloadUrl,
            chainPath,
            app.getPath("userData"),
            standalone,
            win,
            mixpanelInfo,
            initializeHeadlessCts.token
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
    win?.webContents.send("start headless");
    await standalone.execute(getHeadlessArgs());

    console.log("Register exit handler.");
    standalone.once("exit", async () => {
      console.error("Headless exited by self.");
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

function createWindow(): BrowserWindow {
  let _win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), "preload.js"),
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  console.log(app.getAppPath());

  if (isDev) {
    _win.loadURL("http://localhost:9000");
    _win.webContents.openDevTools();
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

async function initializeRemoteHeadless(): Promise<void> {
  /*
  1. Check APV and update if needed.
  2. Execute remote headless.
  */
  console.log(`Initialize remote headless. (win: ${win?.getTitle})`);

  if (initializeHeadlessCts !== null) {
    console.error("Cannot initialize remote headless while initializing headless.");
    return;
  }

  if (standalone.alive) {
    console.error("Cannot initialize remote headless while headless is running.");
    return;
  }

  if (lockfile.checkSync(lockfilePath)) {
    console.error(
        "Cannot initialize remote headless while updater is running.\n",
        lockfilePath
    );
    return;
  }

  const peerInfos: string[] = getConfig("PeerStrings");
  if (peerInfos.length > 0) {
    const peerApvToken = standalone.apv.query(peerInfos[0]);
    if (peerApvToken !== null) {
      if (
          standalone.apv.verify(
              getConfig("TrustedAppProtocolVersionSigners"),
              peerApvToken
          )
      ) {
        const peerApv = standalone.apv.analyze(peerApvToken);
        const localApvToken = getConfig("AppProtocolVersion");
        const localApv = standalone.apv.analyze(localApvToken);
      } else {
        console.log(
            `Ignore APV[${peerApvToken}] due to failure to validating.`
        );
      }
    }
  }

  initializeHeadlessCts = CancellationToken.create();

  try {
    initializeHeadlessCts.token.throwIfCancelled();
    win?.webContents.send("start remote headless");
    remoteHeadless = new RemoteHeadless();
    await remoteHeadless.execute();

    console.log("Register exit handler.");
    standalone.once("exit", async () => {
      console.error("remote headless exited by self.");
      await relaunchHeadless();
    });
  } catch (error) {
    console.error(`Error occurred during initialize remote headless(). ${error}`);
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


/**
 * 프로그램이 시작될 때 이전 실행에서 발생한 부산물을 정리합니다.
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

/**
 * lockfile lock이 걸려있을 경우 unlock합니다.
 */
function cleanUpLockfile() {
  if (lockfile.checkSync(lockfilePath)) {
    lockfile.unlockSync(lockfilePath);
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

  let guidPath = path.join(planetariumPath, ".installer_mixpanel_uuid");

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
  if (useRemoteHeadless)
  {
    initializeRemoteHeadless();
  }
  else
  {
    initializeHeadless();
  }
}

async function quitAllProcesses(reason: string = "default") {
  await stopHeadlessProcess(reason);
  if (gameNode === null) return;
  let pid = gameNode.pid;
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
  if (mixpanel !== null) {
    mixpanel.track(
      "Launcher/Relaunch",
      { distinct_id: mixpanelUUID, ip },
      () => {
        app.relaunch();
        app.exit();
      }
    );
  } else {
    app.relaunch();
    app.exit();
  }
}

function getHeadlessArgs(): string[] {
  const args = [
    `-V=${getConfig("AppProtocolVersion")}`,
    `-G=${getConfig("GenesisBlockPath")}`,
    `-D=${getConfig("MinimumDifficulty")}`,
    `--store-type=${getConfig("StoreType")}`,
    `--store-path=${getBlockChainStorePath()}`,
    ...getConfig("IceServerStrings")
      .map((iceServerString) => `-I=${iceServerString}`),
    ...getConfig("PeerStrings")
      .map((peerString) => `--peer=${peerString}`),
    ...getConfig("TrustedAppProtocolVersionSigners")
      .map(
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
    ...(isDev ? ["--no-cors"] : []),
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

