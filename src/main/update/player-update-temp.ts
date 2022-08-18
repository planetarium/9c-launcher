import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import path from "path";
import fs from "fs";
import extractZip from "extract-zip";
import { spawn as spawnPromise } from "child-process-promise";
import { get as getConfig } from "../../config";
import { getDownloadUrl, getVersionNumberFromAPV } from "./util";
import lockfile from "lockfile";

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
  getWindow(): Electron.BrowserWindow | null;
}

const playerTempPath = path.join(app.getPath("temp"), "player");
const extractPath = path.join(app.getPath("userData"), "player");

export async function playerUpdateTemp(
  win: Electron.BrowserWindow | null,
  listeners: IUpdateOptions
) {
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

  const localVersionNumber: number = getVersionNumberFromAPV(
    getConfig("AppProtocolVersion")
  );

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  await listeners.downloadStarted();

  const network = getConfig("Network", "9c-main");
  const netenv = network === "9c-main" ? "main" : network;

  // FIXME: project version number hard coding: 1.
  const downloadUrl = getDownloadUrl(
    netenv,
    localVersionNumber,
    "player",
    1,
    process.platform
  );

  win.webContents.send("update download started");

  // TODO: It would be nice to have a continuous download feature.
  const options: ElectronDLOptions = {
    onStarted: (downloadItem: DownloadItem) => {
      console.log("[player] Starts to download:", downloadItem);
    },
    onProgress: (status: IDownloadProgress) => {
      const percent = (status.percent * 100) | 0;
      console.log(
        `[player] Downloading ${downloadUrl}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
      );
      win?.webContents.send("update download progress", status);
    },
    directory: playerTempPath,
  };
  console.log("[player] Starts to download:", downloadUrl);
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
  console.log("[player] Finished to download:", dlPath);

  if (fs.existsSync(extractPath)) {
    fs.rmdirSync(extractPath, { recursive: true });
  } else {
    fs.mkdirSync(extractPath);
  }

  console.log("[player] Clean up exists player");

  console.log("[player] The 9C player installation path:", extractPath);
  if (process.platform == "win32") {
    // Unzip ZIP
    console.log(
      "[player] Start to extract the zip archive",
      dlPath,
      "to",
      extractPath
    );

    await extractZip(dlPath, {
      dir: extractPath,
      onEntry: (_, zipfile) => {
        const progress = zipfile.entriesRead / zipfile.entryCount;
        win?.webContents.send("update extract progress", progress);
      },
    });
    win.webContents.send("update extract complete");
  } else if (process.platform == "darwin") {
    // untar .tar.{gz,bz2}
    const lowerFname = dlFname.toLowerCase();
    const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
    console.log(
      "[player] Start to extract the tarball archive",
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
    console.warn("[player] Not supported platform.");
    return;
  }

  win.webContents.send("update copying progress");
  win.webContents.send("update copying complete");

  lockfile.unlockSync(lockfilePath);
  console.log(
    "Removed 'encounter different version' lockfile at ",
    lockfilePath
  );

  listeners.relaunchRequired();
}
