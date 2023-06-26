import { UpdateInfo, autoUpdater } from "electron-updater";
import log from "electron-log";
import { netenv } from "src/config";
import { IUpdateOptions } from "./types";
import { app } from "electron";

class AppUpdater {
  win: Electron.BrowserWindow;
  updateOptions: IUpdateOptions;

  constructor(
    win: Electron.BrowserWindow,
    baseUrl: string,
    updateOptions: IUpdateOptions
  ) {
    this.win = win;
    this.updateOptions = updateOptions;
    log.transports.file.level =
      process.env.NODE_ENV === "production" ? "info" : "debug";
    autoUpdater.logger = log;

    autoUpdater.setFeedURL(`${baseUrl}/${netenv}/launcher`);

    autoUpdater.on("update-available", (updateInfo) =>
      this.handleUpdateAvailable(updateInfo)
    );
    autoUpdater.on("update-downloaded", (updateInfo) =>
      this.handleUpdateDownloaded(updateInfo)
    );
    autoUpdater.on("error", (err) => this.handleError(err));
  }

  checkForUpdate() {
    autoUpdater.checkForUpdates();
  }

  async execute() {
    await this.updateOptions.downloadStarted();
    autoUpdater.quitAndInstall();
  }

  handleUpdateAvailable(updateInfo: UpdateInfo) {
    console.log(
      `Found update (local version: ${app.getVersion()})`,
      updateInfo
    );
  }

  handleUpdateDownloaded(updateInfo: UpdateInfo) {
    if (isVersionGreaterThan(updateInfo.version, app.getVersion())) {
      this.win.webContents.executeJavaScript(
        `window.location.hash = '/confirm-update'`
      );
    }
  }

  handleError(error: Error) {
    console.info("Updater error occurred", error);
  }
}

function isVersionGreaterThan(v1: string, v2: string) {
  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);

  for (let i = 0; i < v1Parts.length; ++i) {
    if (v1Parts[i] > v2Parts[i]) {
      return true;
    } else if (v1Parts[i] < v2Parts[i]) {
      return false;
    }
  }

  return false;
}

export default AppUpdater;
