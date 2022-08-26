import { encode, decode, BencodexDict } from "bencodex";
import { DownloadItem, app, dialog, shell } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import extractZip from "extract-zip";
import * as utils from "../../utils";
import { IDownloadProgress } from "src/interfaces/ipc";
import { tmpName } from "tmp-promise";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import {
  get as getConfig,
  apvVersionNumber,
  netenv,
  EXECUTE_PATH,
  WIN_GAME_PATH,
} from "../../config";
import path from "path";
import fs from "fs";
import Headless from "../headless/headless";
import lockfile from "lockfile";
import { spawn as spawnPromise } from "child-process-promise";
import { playerUpdate } from "./player-update";
import { getDownloadUrl, decodeLocalAPV } from "./util";

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

export async function update(update: Update, listeners: IUpdateOptions) {
  if (!getConfig("UseUpdate", process.env.NODE_ENV === "production")) {
    console.log("`UseUpdate` option is false, Do not proceed update!");
    return;
  }

  const localVersionNumber: number = update.current ?? apvVersionNumber;
  const peerVersionNumber: number = update.newer;
  const peerVersionExtra: string = update.extras;

  const win = listeners.getWindow();

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  console.log("peerVersionExtra (hex):", peerVersionExtra);
  const buffer = Buffer.from(peerVersionExtra, "hex");
  console.log("peerVersionExtra (bytes):", buffer);
  const extra = decode(buffer) as BencodexDict;
  console.log("peerVersionExtra (decoded):", JSON.stringify(extra)); // Stringifies the JSON for extra clarity in the log

  // FIXME: project version number hard coding: 1.
  const launcherDownloadUrl = getDownloadUrl(
    netenv,
    peerVersionNumber,
    "launcher",
    1,
    process.platform
  );
  // FIXME: project version number hard coding: 1.
  const playerDownloadUrl = getDownloadUrl(
    netenv,
    peerVersionNumber,
    "player",
    1,
    process.platform
  );

  console.log("launcherDownloadUrl: ", launcherDownloadUrl);
  console.log("playerDownloadUrl: ", playerDownloadUrl);

  if (peerVersionNumber <= localVersionNumber) {
    const executePath = EXECUTE_PATH[process.platform] || WIN_GAME_PATH;

    if (!fs.existsSync(executePath)) {
      await playerUpdate(playerDownloadUrl, win);
    }

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

  // if (launcherDownloadUrl == null) {
  //   console.log(`Stop update process. Not support ${process.platform}.`);
  //   return;
  // }

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
        `Downloading ${launcherDownloadUrl}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
      );
      win?.webContents.send("update download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("Starts to download:", launcherDownloadUrl);
  let dl: DownloadItem | null | undefined;
  try {
    dl = await download(win, launcherDownloadUrl, options);
  } catch (error) {
    win.webContents.send("go to error page", "download-binary-failed");
    throw new DownloadBinaryFailedError(launcherDownloadUrl);
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
    // Windows can't replace or remove executable file
    // while process is up, so we should change name instead
    const src = app.getPath("exe");
    const basename = path.basename(src);
    const dirname = path.dirname(src);
    const dst = path.join(dirname, "bak_" + basename);
    await fs.promises.rename(src, dst);
    console.log("The executing file has renamed from", src, "to", dst);

    // TODO: 9c-updater- prefix in front of temp directory name
    const tempDir = await tmpName();

    // Unzip ZIP
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
  } else if (process.platform == "darwin" || process.platform == "linux") {
    // untar .tar.{gz,bz2}
    const lowerFname = dlFname.toLowerCase();
    const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
    console.log(
      "Start to extract the tarball archive",
      dlPath,
      "to",
      extractPath
    );
    win?.webContents.send("update extract progress", 50);

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
    win.webContents.send("update extract complete");
    win.webContents.send("update copying progress");

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

  win.webContents.send("update copying complete");

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
    await playerUpdate(playerDownloadUrl, win);
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
