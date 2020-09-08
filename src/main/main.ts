/* eslint-disable */
import {
  LOCAL_SERVER_PORT,
  electronStore,
  BLOCKCHAIN_STORE_PATH,
  MAC_GAME_PATH,
  WIN_GAME_PATH,
  RPC_LOOPBACK_HOST,
  RPC_SERVER_PORT,
  REQUIRED_DISK_SPACE,
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
} from "electron";
import { spawn as spawnPromise } from "child-process-promise";
import path from "path";
import fs from "fs";
import { ChildProcess, spawn } from "child_process";
import { download, Options as ElectronDLOptions } from "electron-dl";
import "@babel/polyfill";
import extractZip from "extract-zip";
import log from "electron-log";
import { BencodexDict, decode } from "bencodex";
import { tmpName } from "tmp-promise";
import lockfile from "lockfile";
import checkDiskSpace from "check-disk-space";
import { retry } from "@lifeomic/attempt";
import { DifferentAppProtocolVersionEncounterSubscription } from "../generated/graphql";
import { initializeSentry } from "../preload/sentry";
import logoImage from "./resources/logo.png";

initializeSentry();

log.transports.file.maxSize = 1024 * 1024 * 15;
Object.assign(console, log.functions);

let win: BrowserWindow | null = null;
let tray: Tray;
let runningPids: number[] = [];
let isQuiting = false;
let standaloneNode: ChildProcess;
let standaloneExited = false;
let standaloneRetried = false;

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // eslint-disable-next-line no-unused-expressions
    win?.show();
  });

  cleanUp();

  initializeApp();
  initializeIpc();
}

function executeStandalone() {
  standaloneExited = false;
  const node = execute(
    path.join(
      app.getAppPath(),
      "publish",
      "NineChronicles.Standalone.Executable"
    ),
    [
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
      `--no-trusted-state-validators=${electronStore.get(
        "NoTrustedStateValidators"
      )}`,
      "--rpc-server",
      `--rpc-listen-host=${RPC_LOOPBACK_HOST}`,
      `--rpc-listen-port=${RPC_SERVER_PORT}`,
      "--graphql-server",
      "--graphql-host=localhost",
      `--graphql-port=${LOCAL_SERVER_PORT}`,
      `--mpt=${electronStore.get("MPT")}`,
      `--workers=${electronStore.get("Workers")}`,
      `--confirmations=${electronStore.get("Confirmations")}`,
    ]
  );
  node.addListener("exit", (code) => {
    console.error(`Standalone exited with exit code: ${code}`);
    setStandaloneExited();
  });

  return node;
}

function initializeApp() {
  app.on("ready", () => {
    standaloneNode = executeStandalone();
    createWindow();
    createTray(path.join(app.getAppPath(), logoImage));
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
  ipcMain.on("check disk permission", (event) => {
    try {
      if (!fs.existsSync(BLOCKCHAIN_STORE_PATH)) {
        console.log("Create directory for given blockchain path.");
        fs.mkdirSync(BLOCKCHAIN_STORE_PATH, { recursive: true });
      }
    } catch (err) {
      console.error("Error occurred while creating directory.", err);
      if (err.code === "EACCES" || err.code === "EPERM") return false;
    }

    try {
      fs.accessSync(BLOCKCHAIN_STORE_PATH, fs.constants.F_OK);
      event.returnValue = true;
    } catch (err) {
      event.returnValue = false;
      console.error(
        "No read/write access to the path: ",
        BLOCKCHAIN_STORE_PATH,
        err
      );
    }
  });

  ipcMain.on("check disk space", (event) => {
    checkDiskSpace(BLOCKCHAIN_STORE_PATH).then((diskSpace) => {
      if (diskSpace.free < REQUIRED_DISK_SPACE) {
        event.returnValue = false;
        console.log("Disk space is not enough: ", diskSpace.free);
        win?.webContents.send("not enough space on the disk");
      } else {
        event.returnValue = true;
      }
    });
  });

  ipcMain.on("check standalone", async (event) => {
    if (!standaloneRetried && standaloneExited) {
      await downloadSnapshot({ properties: {} }, false);
      standaloneRetried = true;
    } else if (standaloneExited) {
      setStandaloneExited();
    }
    event.returnValue = standaloneExited;
  });

  ipcMain.on("download metadata", (_, options: IDownloadOptions) => {
    options.properties.directory = app.getPath("userData");
    options.properties.filename = "meta.json";
    if (win != null) {
      download(
        win,
        `${electronStore.get("SNAPSHOT_DOWNLOAD_PATH") as string}.json`,
        options.properties
      )
        .then(async (dl) => {
          const path = dl.getSavePath();
          const meta = await fs.promises.readFile(path, "utf-8");
          console.log("Metadata download complete: ", meta);
          win?.webContents.send("metadata downloaded", meta);
        })
        .catch((error) => {
          console.log(
            `An error occurred during downloading metadata: ${error}`
          );
          win?.webContents.send("snapshot complete");
        });
    }
  });

  ipcMain.on("download snapshot", async (_, options: IDownloadOptions) => {
    await downloadSnapshot(options);
  });

  ipcMain.on(
    "encounter different version",
    async (event, data: DifferentAppProtocolVersionEncounterSubscription) => {
      quitAllProcesses();

      console.log("Encounter a different version:", data);
      if (win == null) return;

      const { differentAppProtocolVersionEncounter } = data;
      console.log(differentAppProtocolVersionEncounter);

      const { peerVersion } = differentAppProtocolVersionEncounter;
      if (peerVersion.extra == null) return; // 형식에 안 맞는 피어이니 무시.

      console.log("peerVersion.extra (hex):", peerVersion.extra);
      const buffer = Buffer.from(peerVersion.extra, "hex");
      console.log("peerVersion.extra (bytes):", buffer);
      const extra = decode(buffer) as BencodexDict;
      console.log("peerVersion.extra (decoded):", JSON.stringify(extra)); // 다른 프로세스라 잘 안보여서 JSON으로...
      const macOSBinaryUrl = extra.get("macOSBinaryUrl") as string;
      const windowsBinaryUrl = extra.get("WindowsBinaryUrl") as string;
      console.log("macOSBinaryUrl: ", macOSBinaryUrl);
      console.log("WindowsBinaryUrl: ", windowsBinaryUrl);
      const timestamp = extra.get("timestamp") as string;
      const downloadUrl =
        process.platform === "win32"
          ? windowsBinaryUrl
          : process.platform === "darwin"
          ? macOSBinaryUrl
          : null;

      if (downloadUrl == null) return; // 지원 안 하는 플랫폼이니 무시.

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
      const dl = await download(win, downloadUrl, options);
      win?.webContents.send("update download complete");
      const dlFname = dl.getFilename();
      const dlPath = dl.getSavePath();
      console.log("Finished to download:", dlPath);

      const extractPath =
        process.platform == "darwin" // .app으로 실행한 건지 npm run dev로 실행한 건지도 확인해야 함
          ? path.dirname(
              path.dirname(path.dirname(path.dirname(app.getAppPath())))
            )
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
        const dst = path.join(dirname, `bak_${basename}`);
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
        win?.webContents.send("update extract complete");
        console.log("The zip archive", dlPath, "has extracted to", tempDir);
        win?.webContents.send("update copying progress");
        await copyDir(tempDir, extractPath);
        win?.webContents.send("update copying complete");
      } else if (process.platform == "darwin") {
        // .tar.{gz,bz2} 해제
        const lowerFname = dlFname.toLowerCase();
        const bz2 =
          lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
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
      app.relaunch();
      app.exit();

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
  );

  ipcMain.on("launch game", (_, info: IGameStartOptions) => {
    const node = execute(
      path.join(
        app.getAppPath(),
        process.platform === "darwin" ? MAC_GAME_PATH : WIN_GAME_PATH
      ),
      info.args
    );
    node.on("close", (code) => {
      win?.webContents.send("game closed");
      win?.show();
    });
    node.on("exit", (code) => {
      win?.webContents.send("game closed");
      win?.show();
    });
  });

  ipcMain.on("clear cache", (event) => {
    quitAllProcesses();
    // FIXME: taskkill을 해도 블록 파일에 락이 남아있어서 1초를 기다리는데, 조금 더 정밀한 방법으로 해야 함
    setTimeout(() => {
      try {
        deleteBlockchainStore(BLOCKCHAIN_STORE_PATH);
        event.returnValue = true;
      } catch (e) {
        console.log(e);
        event.returnValue = false;
      } finally {
        // Clear cache한 후 앱을 종료합니다.
        isQuiting = true;
        app.relaunch();
        app.exit();
      }
    }, 1000);
  });

  ipcMain.on("select-directory", async (event) => {
    if (win === null) throw Error("BrowserWindow is null");
    const directory = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    });
    event.returnValue = directory.filePaths;
  });
}

function createWindow() {
  win = new BrowserWindow({
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
    win.loadURL("http://localhost:9000");
    win.webContents.openDevTools();
  } else {
    win.loadFile("index.html");
  }

  win.on("close", function (event: any) {
    if (!isQuiting) {
      event.preventDefault();
      win?.hide();
    }
  });
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
  const bakExecutable = path.join(dirname, `bak_${basename}`);

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

function execute(binaryPath: string, args: string[]) {
  if (isDev) {
    console.log(`Execute subprocess: ${binaryPath} ${args.join(" ")}`);
  }
  const node = spawn(binaryPath, args);
  runningPids.push(node.pid);

  node.stdout?.on("data", (data) => {
    console.log(`${data}`);
  });

  node.stderr?.on("data", (data) => {
    console.log(`${data}`);
  });
  return node;
}

function quitAllProcesses() {
  runningPids.forEach((pid) => {
    if (process.platform == "darwin") process.kill(pid);
    if (process.platform == "win32")
      execute("taskkill", ["/pid", pid.toString(), "/f", "/t"]);
  });
  runningPids = [];
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
        click() {
          win?.show();
        },
      },
      {
        label: "Quit Launcher",
        click() {
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

function extractSnapshot(snapshotPath: string) {
  console.log(`extract started.
extractPath: [ ${BLOCKCHAIN_STORE_PATH} ],
extractTarget: [ ${snapshotPath} ]`);
  try {
    return extractZip(snapshotPath, {
      dir: BLOCKCHAIN_STORE_PATH,
      onEntry: (_, zipfile) => {
        const progress = zipfile.entriesRead / zipfile.entryCount;
        win?.webContents.send("extract progress", progress);
      },
    }).then((_) => {
      win?.webContents.send("extract complete");
      fs.unlinkSync(snapshotPath);
    });
  } catch (err) {
    console.log(err);
  }
}

function deleteBlockchainStore(path: string) {
  fs.rmdirSync(path, { recursive: true });
}

async function copyDir(srcDir: string, dstDir: string) {
  try {
    const stat = await fs.promises.stat(dstDir);

    if (!stat.isDirectory()) {
      await fs.promises.unlink(dstDir);
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  }

  for (const ent of await fs.promises.readdir(srcDir, {
    withFileTypes: true,
  })) {
    const src = path.join(srcDir, ent.name);
    const dst = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      await copyDir(src, dst);
    } else {
      try {
        await fs.promises.copyFile(src, dst);
      } catch (e) {
        console.warn("Failed to copy a file", src, "->", dst, ":\n", e);
      }
    }
  }
}

function setStandaloneExited() {
  standaloneExited = true;
  win?.webContents.send("standalone exited");
}

async function downloadSnapshot(
  options: IDownloadOptions,
  quitProcess = true
): Promise<void> {
  console.log("downloading snapshot.");
  if (quitProcess) {
    // Prevent the exit event lead renderer to error page because it's intended.
    standaloneNode.removeAllListeners("exit");
    quitAllProcesses();
  }

  await retry(
    async (context) => {
      try {
        console.log(
          `Trying to delete chain (${context.attemptNum}/${
            context.attemptNum + context.attemptsRemaining
          })`
        );
        deleteBlockchainStore(BLOCKCHAIN_STORE_PATH);
      } catch (err) {
        if (err.code !== "EBUSY" && err.code !== "EPERM") {
          console.error(
            `Unhandled error occurred during delete blockchain store. ${err}`
          );
          context.abort();
        }

        throw err;
      }
    },
    { factor: 2, maxAttempts: 5 }
  );
  options.properties.onProgress = (status: IDownloadProgress) =>
    win?.webContents.send("download progress", status);
  options.properties.directory = app.getPath("userData");
  options.properties.filename = "snapshot.zip";
  console.log(win);
  if (win != null) {
    const dl = await download(
      win,
      `${electronStore.get("SNAPSHOT_DOWNLOAD_PATH") as string}.zip`,
      options.properties
    );
    win?.webContents.send("download complete", dl.getSavePath());
    await extractSnapshot(dl.getSavePath());
    standaloneNode = executeStandalone();
    win?.webContents.send("snapshot complete");
  }
}
