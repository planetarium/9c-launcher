import { UpdateInfo, autoUpdater } from "electron-updater";
import log from "electron-log";

class AppUpdater {
  win: Electron.BrowserWindow | null;

  constructor(win: Electron.BrowserWindow | null) {
    this.win = win;
    log.transports.file.level = "debug";
    autoUpdater.logger = log;

    autoUpdater.setFeedURL(
      "https://drfoj4ogb5dwf.cloudfront.net/builder-test/launcher"
    );

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
