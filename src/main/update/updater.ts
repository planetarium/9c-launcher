import { UpdateInfo, autoUpdater } from "electron-updater";
import log from "electron-log";
import { netenv } from "src/config";

class AppUpdater {
  win: Electron.BrowserWindow | null;

  constructor(win: Electron.BrowserWindow | null, baseUrl: string) {
    this.win = win;
    log.transports.file.level = process.env.NODE_ENV === "production" ? "info" : "debug";
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

  handleUpdateAvailable(updateInfo: UpdateInfo) {
    console.log("Found update", updateInfo);
  }

  handleUpdateDownloaded(updateInfo: UpdateInfo) {
    autoUpdater.quitAndInstall();
  }

  handleError(error: Error) {
    console.info("Updater error occurred", error);
  }
}

export default AppUpdater;
