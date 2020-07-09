import {
  LOCAL_SERVER_PORT,
  electronStore,
  BLOCKCHAIN_STORE_PATH,
  MAC_GAME_PATH,
  WIN_GAME_PATH,
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
  autoUpdater,
} from "electron";
import { spawn as spawnPromise } from "child-process-promise";
import path from "path";
import fs, { copyFile } from "fs";
import { ChildProcess, spawn } from "child_process";
import { download, Options as ElectronDLOptions } from "electron-dl";
import logoImage from "./resources/logo.png";
import { initializeSentry } from "../preload/sentry";
import "@babel/polyfill";
import extractZip from "extract-zip";
import log from "electron-log";
import { DifferentAppProtocolVersionEncounterSubscription } from "../generated/graphql";
import { BencodexDict, decode, encode } from "bencodex";
import zlib from "zlib";
import tmp, { tmpName } from "tmp-promise";
import extract from "extract-zip";

initializeSentry();

Object.assign(console, log.functions);

let win: BrowserWindow | null = null;
let tray: Tray;
let pids: number[] = [];
let isQuiting: boolean = false;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    win?.show();
  });

  initializeApp();
  initializeIpc();
}

function initializeApp() {
  app.on("ready", () => {
    execute(
      path.join(
        app.getAppPath(),
        "publish",
        "NineChronicles.Standalone.Executable"
      ),
      ["--graphql-server=true", `--graphql-port=${LOCAL_SERVER_PORT}`]
    );
    createWindow();
    createTray(path.join(app.getAppPath(), logoImage));
  });

  app.on("quit", (event) => {
    pids.forEach((pid) => {
      if (process.platform == "darwin") process.kill(pid);
      if (process.platform == "win32")
        execute("taskkill", ["/pid", pid.toString(), "/f", "/t"]);
    });
  });

  app.on("activate", (event) => {
    event.preventDefault();
    win?.show();
  });
}

function initializeIpc() {
  ipcMain.on("download snapshot", (_, options: IDownloadOptions) => {
    options.properties.onProgress = (status: IDownloadProgress) =>
      win?.webContents.send("download progress", status);
    options.properties.directory = app.getPath("userData");
    console.log(win);
    if (win != null) {
      download(
        win,
        electronStore.get("SNAPSHOT_DOWNLOAD_PATH") as string,
        options.properties
      )
        .then((dl) => {
          win?.webContents.send("download complete", dl.getSavePath());
          return dl.getSavePath();
        })
        .then((path) => extractSnapshot(path));
    }
  });

  // FIXME: 이렇게 변수로 하지 말고 .lock 파일 하나 만들어서 걸자
  let downloadingNewVersion = false;

  ipcMain.on(
    "encounter different version",
    async (event, data: DifferentAppProtocolVersionEncounterSubscription) => {
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

      // TODO: 이어받기 되면 좋을 듯
      const options: ElectronDLOptions = {
        onStarted: (downloadItem: DownloadItem) => {
          downloadingNewVersion = true;
          console.log("Starts to download:", downloadItem);
        },
        onProgress: (status: IDownloadProgress) => {
          const percent = (status.percent * 100) | 0;
          console.log(
            `Downloading ${downloadUrl}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
          );
          win?.webContents.send("update download progress", status);
        },
        onCancel: () => {
          downloadingNewVersion = false;
        },
        directory: app.getPath("temp"),
      };
      if (downloadingNewVersion) return;
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
        const dst = path.join(dirname, "bak_" + basename);
        await fs.promises.rename(src, dst);
        console.log("The executing file has renamed from", src, "to", dst);

        // TODO: temp directory 앞에 9c-updater- 접두어
        const tempDir = await tmpName();

        // TODO: 재시작 후에 dst 파일 있으면 청소하는 거 추가해야...
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
    });
    node.on("exit", (code) => {
      win?.webContents.send("game closed");
    });
    win?.minimize();
  });

  ipcMain.on("clear cache", (event) => {
    try {
      deleteBlockchainStore(BLOCKCHAIN_STORE_PATH);
      event.returnValue = true;
    } catch (e) {
      console.log(e);
      event.returnValue = false;
    }
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

  win.on("minimize", function (event: any) {
    event.preventDefault();
    win?.hide();
  });

  win.on("close", function (event: any) {
    if (!isQuiting) {
      event.preventDefault();
      win?.hide();
    }
  });
}

function execute(binaryPath: string, args: string[]) {
  console.log(`Execute subprocess: ${binaryPath} ${args.join(" ")}`);
  let node = spawn(binaryPath, args);
  pids.push(node.pid);

  node.stdout?.on("data", (data) => {
    console.log(`${data}`);
  });

  node.stderr?.on("data", (data) => {
    console.log(`${data}`);
  });
  return node;
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

function extractSnapshot(snapshotPath: string) {
  console.log(`extract started.
extractPath: [ ${BLOCKCHAIN_STORE_PATH} ],
extractTarget: [ ${snapshotPath} ]`);
  try {
    extractZip(snapshotPath, {
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
  console.log("Copy a directory ", srcDir, "->", dstDir);
  if (!(await fs.promises.stat(dstDir)).isDirectory()) {
    fs.promises.mkdir(dstDir, { recursive: true });
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
        console.log("Copy a file ", src, "->", dst);
      } catch (e) {
        console.warn("Failed to copy a file", src, "->", dst, ":\n", e);
      }
    }
  }
}
