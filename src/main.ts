import {
  LOCAL_SERVER_PORT,
  electronStore,
  BLOCKCHAIN_STORE_PATH,
  MAC_GAME_PATH,
  WIN_GAME_PATH,
} from "./config";
import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { ChildProcess, spawn } from "child_process";
import { download, Options as ElectronDLOptions } from "electron-dl";
import logoImage from "./resources/logo.png";
import "@babel/polyfill";
import extractZip from "extract-zip";
import log from "electron-log";

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";

Object.assign(console, log.functions);

let win: BrowserWindow | null = null;
let tray: Tray;
let pids: number[] = [];
let isQuiting: boolean = false;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage)
  });

  console.log(app.getAppPath());

  if (IS_DEV) {
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

ipcMain.on("download snapshot", (event, options: IDownloadOptions) => {
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
      .then((path) => extract(path));
  }
});

ipcMain.on("launch game", (event, info) => {
  execute(
    path.join(
      app.getAppPath(),
      process.platform === "darwin" ? MAC_GAME_PATH : WIN_GAME_PATH
    ),
    info.args
  );
});

ipcMain.on("clear cache", (event) => {
  try {
    deleteBlockchainStore();
    event.returnValue = true;
  } catch (e) {
    console.log(e);
    event.returnValue = false;
  }
});

function execute(binaryPath: string, args: string[]) {
  console.log(`Execute subprocess: ${binaryPath} ${args.join(" ")}`);
  let node = spawn(binaryPath, args);
  pids.push(node.pid);

  node.stdout?.on("data", (data) => {
    process.stdout.write(`${data}`);
  });

  node.stderr?.on("data", (data) => {
    process.stdout.write(`${data}`);
  });
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

function extract(snapshotPath: string) {
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

function deleteBlockchainStore() {
  deleteDirRecursive(BLOCKCHAIN_STORE_PATH);
}

function deleteDirRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDirRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
