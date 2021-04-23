import {
  CUSTOM_SERVER,
  LOCAL_SERVER_HOST,
  LOCAL_SERVER_PORT,
  electronStore,
  BLOCKCHAIN_STORE_PATH,
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
import "@babel/polyfill";
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
import { PermDeviceInformationSharp } from "@material-ui/icons";
import { ClearCacheException } from "./exceptions/clear-cache-exception";

initializeSentry();

log.transports.file.maxSize = 1024 * 1024 * 15;
Object.assign(console, log.functions);

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");
const standaloneExecutablePath = path.join(
  app.getAppPath(),
  "publish",
  "NineChronicles.Headless.Executable"
);
const standaloneExecutableArgs = [
  `-V=${electronStore.get("AppProtocolVersion")}`,
  `-G=${electronStore.get("GenesisBlockPath")}`,
  `-D=${electronStore.get("MinimumDifficulty")}`,
  `--store-type=${electronStore.get("StoreType")}`,
  `--store-path=${BLOCKCHAIN_STORE_PATH}`,
  ...electronStore
    .get("IceServerStrings")
    .map((iceServerString) => `-I=${iceServerString}`),
  ...electronStore
    .get("PeerStrings")
    .map((peerString) => `--peer=${peerString}`),
  ...electronStore
    .get("TrustedAppProtocolVersionSigners")
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
  `--workers=${electronStore.get("Workers")}`,
  `--confirmations=${electronStore.get("Confirmations")}`,
  ...electronStore.get("HeadlessArgs", []),
  ...(isDev ? ["--no-cors"] : []),
];

{
  const awsAccessKey = electronStore.get("AwsAccessKey");
  const awsSecretKey = electronStore.get("AwsSecretKey");
  const awsRegion = electronStore.get("AwsRegion");

  if (
    awsAccessKey !== undefined &&
    awsSecretKey !== undefined &&
    awsRegion !== undefined
  ) {
    standaloneExecutableArgs.push(
      `--aws-access-key=${awsAccessKey}`,
      `--aws-secret-key=${awsSecretKey}`,
      `--aws-region=${awsRegion}`
    );
  }
}

let win: BrowserWindow | null = null;
let tray: Tray;
let isQuiting: boolean = false;
let gameNode: ChildProcessWithoutNullStreams | null = null;
let standalone: Headless = new Headless(standaloneExecutablePath);
let ip: string | null = null;
const mixpanelUUID = loadInstallerMixpanelUUID();
const mixpanel: Mixpanel | null =
  electronStore.get("Mixpanel") && !isDev
    ? createMixpanel(MIXPANEL_TOKEN)
    : null;
let initializeHeadlessCts: {
  cancel: (reason?: any) => void;
  token: CancellationToken;
} | null = null;

export type MixpanelInfo = {
  mixpanel: Mixpanel | null;
  mixpanelUUID: string;
  ip: string | null;
};

ipv4().then((value) => (ip = value));

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
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

  initializeApp();
  initializeIpc();
}

function initializeApp() {
  app.on("ready", () => {
    win = createWindow();
    createTray(path.join(app.getAppPath(), logoImage));
    win.webContents.on("dom-ready", (event) => initializeHeadless());
  });

  app.on("quit", (event) => {
    quitAllProcesses();
  });

  app.on("activate", (event) => {
    event.preventDefault();
    win?.show();
  });
}

async function update(
  localVersionNumber: number,
  peerVersionNumber: number,
  peerVersionExtra: string
) {
  if (peerVersionNumber <= localVersionNumber) {
    console.log(
      "Encountered version is not higher than the local version. Abort update."
    );
    return;
  }

  if (lockfile.checkSync(lockfilePath)) {
    console.log(
      "'encounter different version' event seems running already. Stop this flow."
    );
    return;
  }

  try {
    lockfile.lockSync(lockfilePath);
    console.log(
      "Created 'encounter different version' lockfile at ",
      lockfilePath
    );
  } catch (e) {
    console.error("Error occurred during trying lock.");
    throw e;
  }

  await quitAllProcesses();

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  console.log("peerVersionExtra (hex):", peerVersionExtra);
  const buffer = Buffer.from(peerVersionExtra, "hex");
  console.log("peerVersionExtra (bytes):", buffer);
  const extra = decode(buffer) as BencodexDict;
  console.log("peerVersionExtra (decoded):", JSON.stringify(extra)); // 다른 프로세스라 잘 안보여서 JSON으로...
  const macOSBinaryUrl = extra.get("macOSBinaryUrl") as string;
  const windowsBinaryUrl = extra.get("WindowsBinaryUrl") as string;
  console.log("macOSBinaryUrl: ", macOSBinaryUrl);
  console.log("WindowsBinaryUrl: ", windowsBinaryUrl);
  const downloadUrl =
    process.platform === "win32"
      ? windowsBinaryUrl
      : process.platform === "darwin"
      ? macOSBinaryUrl
      : null;

  if (downloadUrl == null) {
    console.log(`Stop update process. Not support ${process.platform}.`);
    return;
  }

  // TODO: 이어받기 되면 좋을 듯
  const options: ElectronDLOptions = {
    onStarted: (downloadItem: DownloadItem) => {
      console.log("Starts to download:", downloadItem);
    },
    onProgress: (status: IDownloadProgress) => {
      const percent = (status.percent * 100) | 0;
      console.log(
        `Downloading ${downloadUrl}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
      );
      win?.webContents.send("update download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("Starts to download:", downloadUrl);
  let dl: DownloadItem | null | undefined;
  try {
    dl = await download(win, downloadUrl, options);
  } catch (error) {
    win.webContents.send("go to error page", "download-binary-failed");
    throw new DownloadBinaryFailedError(downloadUrl);
  }

  win.webContents.send("update download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("Finished to download:", dlPath);

  const extractPath =
    process.platform == "darwin" // .app으로 실행한 건지 npm run dev로 실행한 건지도 확인해야 함
      ? path.dirname(path.dirname(path.dirname(path.dirname(app.getAppPath()))))
      : path.dirname(path.dirname(app.getAppPath()));
  console.log("The 9C app installation path:", extractPath);

  const appDirName = app.getAppPath();
  // FIXME: "config.json" 이거 하드코딩하지 말아야 함
  const configFileName = "config.json";

  // 압축 해제하기 전에 기존 설정 꿍쳐둔다. 나중에 기존 설정 내용이랑 새 디폴트 값들이랑 합쳐야 함.
  const configPath = path.join(appDirName, configFileName);
  const bakConfig = JSON.parse(
    await fs.promises.readFile(configPath, { encoding: "utf-8" })
  );
  console.log("The existing configuration:", bakConfig);

  if (process.platform == "win32") {
    // 윈도는 프로세스 떠 있는 실행 파일을 덮어씌우거나 지우지 못하므로 이름을 바꿔둬야 함.
    const src = app.getPath("exe");
    const basename = path.basename(src);
    const dirname = path.dirname(src);
    const dst = path.join(dirname, "bak_" + basename);
    await fs.promises.rename(src, dst);
    console.log("The executing file has renamed from", src, "to", dst);

    // TODO: temp directory 앞에 9c-updater- 접두어
    const tempDir = await tmpName();

    // ZIP 압축 해제
    console.log("Start to extract the zip archive", dlPath, "to", tempDir);

    await extractZip(dlPath, {
      dir: tempDir,
      onEntry: (_, zipfile) => {
        const progress = zipfile.entriesRead / zipfile.entryCount;
        win?.webContents.send("update extract progress", progress);
      },
    });
    win.webContents.send("update extract complete");
    console.log("The zip archive", dlPath, "has extracted to", tempDir);
    win.webContents.send("update copying progress");
    await utils.copyDir(tempDir, extractPath);
    console.log("Copied extracted files from", tempDir, "to", extractPath);
    try {
      await fs.promises.rmdir(tempDir, { recursive: true });
      console.log("Removed all temporary files from", tempDir);
    } catch (e) {
      console.warn("Failed to remove temporary files from", tempDir, "\n", e);
    }
    win.webContents.send("update copying complete");
  } else if (process.platform == "darwin") {
    // .tar.{gz,bz2} 해제
    const lowerFname = dlFname.toLowerCase();
    const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
    console.log(
      "Start to extract the tarball archive",
      dlPath,
      "to",
      extractPath
    );
    try {
      await spawnPromise(
        "tar",
        [`xvf${bz2 ? "j" : "z"}`, dlPath, "-C", extractPath],
        { capture: ["stdout", "stderr"] }
      );
    } catch (e) {
      console.error(`${e}:\n`, e.stderr);
      throw e;
    }
    console.log(
      "The tarball archive",
      dlPath,
      "has extracted to ",
      extractPath
    );
  } else {
    console.warn("Not supported platform.");
    return;
  }

  // 압축을 푼 뒤 압축 파일은 제거합니다.
  await fs.promises.unlink(dlPath);

  // 설정 합치기
  const newConfig = JSON.parse(
    await fs.promises.readFile(configPath, { encoding: "utf-8" })
  );
  const config = {
    ...bakConfig,
    ...newConfig,
  };
  await fs.promises.writeFile(configPath, JSON.stringify(config), "utf-8");
  console.log(
    "The existing and new configuration files has been merged:",
    config
  );

  lockfile.unlockSync(lockfilePath);
  console.log(
    "Removed 'encounter different version' lockfile at ",
    lockfilePath
  );

  // 재시작
  relaunch();

  /*
      Electron이 제공하는 autoUpdater는 macOS에서는 무조건 코드사이닝 되어야 동작.
      당장은 쓰고 싶어도 여건이 안 된다.

      FIXME: 이후 Squirell를 붙여서 업데이트하게 바꿉니다.

      const { path: tmpPath } = await tmp.file({
        postfix: ".json",
        discardDescriptor: true,
      });
      const tmpFile = await fs.promises.open(tmpPath, "w");
      const feedData = {
        url: downloadUrl,
      };

      await tmpFile.writeFile(JSON.stringify(feedData), "utf8");
      console.log(`Wrote a temp feed JSON file:`, tmpPath);
      autoUpdater.setFeedURL({ url: `file://${tmpPath}` });

      autoUpdater.on("error", (message) =>
        console.error("AUTOUPDATER:ERROR", message)
      );
      autoUpdater.on("checking-for-update", () =>
        console.error("AUTOUPDATER:CHECKING-FOR-UPDATE")
      );
      autoUpdater.on("update-available", () =>
        console.error("AUTOUPDATER:UPDATE-AVAILABLE")
      );
      autoUpdater.on("update-not-available", () =>
        console.error("AUTOUPDATER:UPDATE-NOT-AVAILABLE")
      );
      autoUpdater.on(
        "update-downloaded",
        (event, releaseNotes, releaseName, releaseDate, updateURL) =>
          console.error(
            "AUTOUPDATER:UPDATE-DOWNLOADED",
            event,
            releaseNotes,
            releaseName,
            releaseDate,
            updateURL
          )
      );
      autoUpdater.on("before-quit-for-update", () =>
        console.error("AUTOUPDATER:BEFORE-QUIT-FOR-UPDATE")
      );

      autoUpdater.checkForUpdates();
      */
}

function initializeIpc() {
  ipcMain.on(
    "encounter different version",
    async (_event, data: DifferentAppProtocolVersionEncounterSubscription) => {
      if (data.differentAppProtocolVersionEncounter.peerVersion.extra) {
        await update(
          data.differentAppProtocolVersionEncounter.localVersion.version,
          data.differentAppProtocolVersionEncounter.peerVersion.version,
          data.differentAppProtocolVersionEncounter.peerVersion.extra
        );
      }
    }
  );

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
    await quitAllProcesses("clear-cache");
    utils.deleteBlockchainStoreSync(BLOCKCHAIN_STORE_PATH);
    if (rerun) initializeHeadless();
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
      const protectedPrivateKey = standalone.keyStore
        .list()
        .find((x) => x.address === address);
      if (protectedPrivateKey === undefined) {
        event.returnValue = [undefined, {}];
        return;
      }

      standalone.keyStore.revokeProtectedPrivateKey(protectedPrivateKey.keyId);
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

  const peerInfos = electronStore.get("PeerStrings");
  if (peerInfos.length > 0) {
    const peerApvToken = standalone.apv.query(peerInfos[0]);
    if (peerApvToken !== null) {
      if (
        standalone.apv.verify(
          electronStore.get("TrustedAppProtocolVersionSigners"),
          peerApvToken
        )
      ) {
        const peerApv = standalone.apv.analyze(peerApvToken);
        const localApvToken = electronStore.get("AppProtocolVersion");
        const localApv = standalone.apv.analyze(localApvToken);

        await update(
          localApv.version,
          peerApv.version,
          encode(peerApv.extra).toString("hex")
        );
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
    if (!utils.isDiskPermissionValid(BLOCKCHAIN_STORE_PATH)) {
      win?.webContents.send("go to error page", "no-permission");
      throw new HeadlessInitializeError(
        `Not enough permission. ${BLOCKCHAIN_STORE_PATH}`
      );
    }

    let freeSpace = await utils.getDiskSpace(BLOCKCHAIN_STORE_PATH);
    if (freeSpace < REQUIRED_DISK_SPACE) {
      win?.webContents.send("go to error page", "disk-space");
      throw new HeadlessInitializeError(
        `Not enough space. ${BLOCKCHAIN_STORE_PATH} (${freeSpace} < ${REQUIRED_DISK_SPACE})`
      );
    }
    win?.webContents.send("start bootstrap");
    const snapshot =
      electronStore.get("StoreType") === "rocksdb"
        ? partitionSnapshot
        : monoSnapshot;

    const snapshotPaths: string[] = electronStore.get("SnapshotPaths");
    if (CUSTOM_SERVER) {
      console.log(
        "As a custom headless server is used, snapshot won't be used."
      );
    } else if (snapshotPaths.length > 0 && win != null) {
      const snapshotDownloadUrls: string[] = electronStore.get("SnapshotPaths");
      let isProcessSuccess = false;
      let recentError: Error = Error();
      for (const snapshotDownloadUrl of snapshotDownloadUrls) {
        try {
          isProcessSuccess = await snapshot.processSnapshot(
            snapshotDownloadUrl,
            BLOCKCHAIN_STORE_PATH,
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
        switch (recentError.constructor) {
          case DownloadSnapshotFailedError:
            win?.webContents.send(
              "go to error page",
              "download-snapshot-failed-error"
            );
            throw new HeadlessInitializeError(`Snapshot download failed.`);
          case DownloadSnapshotMetadataFailedError:
            win?.webContents.send(
              "go to error page",
              "download-snapshot-metadata-failed-error"
            );
            throw new HeadlessInitializeError(
              `Snapshot metadata download failed.`
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
              `Unexpected Error occupied when download snapshot.`
            );
        }
      }
    }

    initializeHeadlessCts.token.throwIfCancelled();
    win?.webContents.send("start headless");
    await standalone.execute(standaloneExecutableArgs);

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
  initializeHeadless();
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
