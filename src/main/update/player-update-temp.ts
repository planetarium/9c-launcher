import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import path from "path";
import fs from "fs";
import extractZip from "extract-zip";
import { spawn as spawnPromise } from "child-process-promise";
import { getDownloadUrl, cleanupOldPlayer } from "./util";
import { playerPath, apvVersionNumber, netenv } from "../../config";
import lockfile from "lockfile";

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
  getWindow(): Electron.BrowserWindow | null;
}

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

  const localVersionNumber: number = apvVersionNumber;

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  await listeners.downloadStarted();

  // FIXME: project version number hard coding: 1.
  const downloadUrl = getDownloadUrl(
    netenv,
    localVersionNumber,
    "player",
    1,
    process.platform
  );

  win.webContents.send("update player download started");

  cleanupOldPlayer();

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
      win?.webContents.send("update player download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("[player] Starts to download:", downloadUrl);
  let dl: DownloadItem | null | undefined;
  try {
    dl = await download(win, downloadUrl, options);
  } catch (error) {
    win.webContents.send("go to error page", "download-binary-failed");
    throw new DownloadBinaryFailedError(downloadUrl);
  }

  win.webContents.send("update player download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("[player] Finished to download:", dlPath);

  if (fs.existsSync(playerPath)) {
    fs.rmdirSync(playerPath, { recursive: true });
  } else {
    fs.mkdirSync(playerPath, { recursive: true });
  }

  console.log("[player] Clean up exists player");

  console.log("[player] The 9C player installation path:", playerPath);
  if (process.platform == "win32") {
    // Unzip ZIP
    console.log(
      "[player] Start to extract the zip archive",
      dlPath,
      "to",
      playerPath
    );

    await extractZip(dlPath, {
      dir: playerPath,
      onEntry: (_, zipfile) => {
        const progress = zipfile.entriesRead / zipfile.entryCount;
        win?.webContents.send("update player extract progress", progress);
      },
    });
    win.webContents.send("update player extract complete");
  } else if (process.platform == "darwin") {
    // untar .tar.{gz,bz2}
    const lowerFname = dlFname.toLowerCase();
    const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
    console.log(
      "[player] Start to extract the tarball archive",
      dlPath,
      "to",
      playerPath
    );
    try {
      await spawnPromise(
        "tar",
        [`xvf${bz2 ? "j" : "z"}`, dlPath, "-C", playerPath],
        { capture: ["stdout", "stderr"] }
      );
    } catch (e) {
      console.error(`${e}:\n`, e.stderr);
      throw e;
    }
    console.log("The tarball archive", dlPath, "has extracted to ", playerPath);
  } else {
    console.warn("[player] Not supported platform.");
    return;
  }

  await fs.promises.unlink(dlPath);

  win.webContents.send("update player copying progress");
  win.webContents.send("update player copying complete");

  lockfile.unlockSync(lockfilePath);
  console.log(
    "Removed 'encounter different version' lockfile at ",
    lockfilePath
  );

  listeners.relaunchRequired();
}
