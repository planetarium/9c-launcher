import { encode, decode, BencodexDict } from "bencodex";
import { DownloadItem, app, dialog, shell } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import { get as getConfig } from "../../config";
import path from "path";
import fs from "fs";
import Headless from "../headless/headless";
import lockfile from "lockfile";
import { playerUpdate } from "./player-update";
import { macExtract, winExtract } from "./extract";

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");

export interface Update {
  current?: number;
  newer: number;
  extras: string;
}

export async function checkForUpdates(
  standalone: Headless
): Promise<Update | null> {
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

        return {
          current: localApv.version,
          newer: peerApv.version,
          extras: encode(peerApv.extra).toString("hex"),
        };
      } else {
        console.log(
          `Ignore APV[${peerApvToken}] due to failure to validating.`
        );
      }
    }
  }
  return null;
}

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
  getWindow(): Electron.BrowserWindow | null;
}

function getVersionNumberFromAPV(apv: string): number {
  const [version] = apv.split("/");
  return parseInt(version, 10);
}

function decodeLocalAPV(): BencodexDict | undefined {
  const localApvToken = getConfig("AppProtocolVersion");
  const extra = Buffer.from(localApvToken.split("/")[1], "hex");

  if (!extra.length) return;

  return decode(extra) as BencodexDict | undefined;
}

export async function update(update: Update, listeners: IUpdateOptions) {
  const localVersionNumber: number =
    update.current ?? getVersionNumberFromAPV(getConfig("AppProtocolVersion"));
  const peerVersionNumber: number = update.newer;
  const peerVersionExtra: string = update.extras;

  const win = listeners.getWindow();

  if (peerVersionNumber <= localVersionNumber) {
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

  await listeners.downloadStarted();

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  console.log("peerVersionExtra (hex):", peerVersionExtra);
  const buffer = Buffer.from(peerVersionExtra, "hex");
  console.log("peerVersionExtra (bytes):", buffer);
  const extra = decode(buffer) as BencodexDict;
  console.log("peerVersionExtra (decoded):", JSON.stringify(extra)); // Stringifies the JSON for extra clarity in the log
  const macOSBinaryUrl = extra.get("macOSBinaryUrl") as string;
  const macOSPlayerBinaryUrl = extra.get("macOSPlayerBinaryUrl") as string;
  const windowsPlayerBinaryUrl = extra.get("WindowsPlayerBinaryUrl") as string;
  const windowsBinaryUrl = extra.get("WindowsBinaryUrl") as string;

  console.log("macOSBinaryUrl: ", macOSBinaryUrl);
  console.log("WindowsBinaryUrl: ", windowsBinaryUrl);
  console.log("macOSPlayerBinaryUrl: ", macOSPlayerBinaryUrl);
  console.log("WindowsPlayerBinaryUrl: ", windowsPlayerBinaryUrl);

  const downloadUrl =
    process.platform === "win32"
      ? windowsBinaryUrl
      : process.platform === "darwin"
      ? macOSBinaryUrl
      : null;
  const playerDownloadUrl =
    process.platform === "win32"
      ? windowsPlayerBinaryUrl
      : process.platform === "darwin"
      ? macOSPlayerBinaryUrl
      : null;

  if (downloadUrl == null) {
    console.log(`Stop update process. Not support ${process.platform}.`);
    return;
  }

  const compatVersion = BigInt(
    (extra.get("CompatiblityVersion") as string | number) ?? 0
  );
  const currentCompatVersion = BigInt(
    (decodeLocalAPV()?.get("CompatiblityVersion") as string | number) ?? 0
  );

  if (compatVersion > currentCompatVersion) {
    console.log(
      `Stop update process. CompatiblityVersion is higher than current.`
    );
    win?.webContents.send("compatiblity-version-higher-than-current");
    if (win) {
      const { checkboxChecked } = await dialog.showMessageBox(win, {
        type: "error",
        message:
          "Nine Chronicles has been updated but the update needs reinstallation due to techincal issues. Sorry for inconvenience.",
        title: "Reinstallation required",
        checkboxChecked: true,
        checkboxLabel: "Open the installer page in browser",
      });
      if (checkboxChecked)
        shell.openExternal("https://bit.ly/9c-manual-update");
      app.exit(0);
    }
    return;
  }

  win?.webContents.send("update download started");
  // TODO: It would be nice to have a continuous download feature.
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
    process.platform == "darwin" // we should check whether it was executed from .app or from yarn dev.
      ? path.dirname(path.dirname(path.dirname(path.dirname(app.getAppPath()))))
      : path.dirname(path.dirname(app.getAppPath()));
  console.log("The 9C app installation path:", extractPath);

  const appDirName = app.getAppPath();
  // FIXME: We shouldn't hardcode "config.json"
  const configFileName = "config.json";

  // Pre-decompress existing config file saving, we will merge them with new default values.
  const configPath = path.join(appDirName, configFileName);
  const bakConfig = JSON.parse(
    await fs.promises.readFile(configPath, { encoding: "utf-8" })
  );
  console.log("The existing configuration:", bakConfig);

  if (process.platform == "win32") {
    await winExtract(dlPath, extractPath, win);
  } else if (process.platform == "darwin") {
    await macExtract(dlPath, extractPath, dlFname);
  } else {
    console.warn("Not supported platform.");
    return;
  }

  // Delete compressed file after decompress.
  await fs.promises.unlink(dlPath);

  // Merging configs
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

  if (playerDownloadUrl) {
    await playerUpdate(playerDownloadUrl, listeners);
  }

  lockfile.unlockSync(lockfilePath);
  console.log(
    "Removed 'encounter different version' lockfile at ",
    lockfilePath
  );

  // Restart
  listeners.relaunchRequired();

  /*
      autoUpdater provided from Electron must code signed to work at macOS
      So we can't use it for now.

      FIXME: By attatching Squirell, make it update, later.

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

export function isUpdating() {
  return lockfile.checkSync(lockfilePath);
}

/**
 * unlock if lockfile locked.
 */
export function cleanUpLockfile() {
  if (lockfile.checkSync(lockfilePath)) {
    lockfile.unlockSync(lockfilePath);
  }
}
