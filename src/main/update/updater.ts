import { UpdateInfo, autoUpdater } from "electron-updater";
import log from "electron-log";
import { netenv } from "src/config";

class AppUpdater {
  win: Electron.BrowserWindow;

  constructor(win: Electron.BrowserWindow, baseUrl: string) {
    this.win = win;
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

  execute() {
    autoUpdater.quitAndInstall();
  }

  handleUpdateAvailable(updateInfo: UpdateInfo) {
    console.log("Found update", updateInfo);
  }

  handleUpdateDownloaded(updateInfo: UpdateInfo) {
    this.win.webContents.executeJavaScript(
      `window.location.hash = '/confirm-update'`
    );
  }

  handleError(error: Error) {
    console.info("Updater error occurred", error);
  }
}

export default AppUpdater;
