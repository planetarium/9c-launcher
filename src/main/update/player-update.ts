import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import fs from "fs";
import { spawn as spawnPromise } from "child-process-promise";
import { get, playerPath } from "src/config";
import { getAvailableDiskSpace } from "src/utils/file";
import lockfile from "lockfile";
import path from "path";
import { IUpdateOptions } from "./types";

export async function performPlayerUpdate(
  win: Electron.BrowserWindow,
  downloadUrl: string,
  size: number,
  updateOptions: IUpdateOptions,
) {
  const lockfilePath = getLockfilePath();

  if (lockfile.checkSync(lockfilePath)) {
    console.log(
      "'encounter different version' event seems running already. Stop this flow.",
    );
    return;
  }

  if (get("PlayerUpdateRetryCount", 0) > 3) {
    console.error("[ERROR] Player Update Failed 3 Times.");
    win.webContents.send("go to error page", "player", {
      url: "reinstall",
    });
    return;
  }

  try {
    lockfile.lockSync(lockfilePath);
    console.log(
      "Created 'encounter different version' lockfile at ",
      lockfilePath,
    );
  } catch (e) {
    console.error("Error occurred during trying lock.");
    throw e;
  }

  await updateOptions.downloadStarted();
  await playerUpdate(win, downloadUrl, size);

  lockfile.unlockSync(lockfilePath);
  console.log(
    "Removed 'encounter different version' lockfile at ",
    lockfilePath,
  );
}

async function playerUpdate(
  win: Electron.BrowserWindow,
  downloadUrl: string,
  size: number,
) {
  console.log("Start player update, from: ", downloadUrl);
  win.webContents.send("update player download started");

  // const available = await getAvailableDiskSpace(app.getPath("temp"));

  // TODO: It would be nice to have a continuous download feature.
  const options: ElectronDLOptions = {
    onStarted: (downloadItem: DownloadItem) => {
      // const totalBytes = downloadItem.getTotalBytes();
      // const totalKB = totalBytes / 1024;

      // if (totalKB > available) {
      //   win.webContents.send("go to error page", "player", {
      //     size: totalBytes,
      //     url: "download-binary-failed-disk-error",
      //   });
      //   downloadItem.cancel();

      //   return;
      // }

      console.log("[player] Starts to download");
    },
    onProgress: (status: IDownloadProgress) => {
      const percent = (status.percent * 100) | 0;
      console.log(
        `[player] Downloading ${downloadUrl}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`,
      );
      win.webContents.send("update player download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("[player] Starts to download:", downloadUrl);
  const dl = await download(win, downloadUrl, options);

  win.webContents.send("update player download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("[player] Finished to download:", dlPath);

  const exists = await fs.promises.stat(playerPath).catch(() => false);

  if (exists) {
    await fs.promises.rm(playerPath, { recursive: true });
  }

  await fs.promises.mkdir(playerPath, { recursive: true });

  console.log("[player] Clean up exists player");

  console.log("[player] The 9C player installation path:", playerPath);
  if (process.platform == "win32") {
    // Unzip ZIP
    console.log(
      "[player] Start to extract the zip archive",
      dlPath,
      "to",
      playerPath,
    );

    try {
      await spawnPromise("powershell", [
        "-Command",
        `Expand-Archive -Path "${dlPath}" -DestinationPath "${playerPath}"`,
      ]);
    } catch (e) {
      win.webContents.send("go to error page", "player", {
        url: "download-binary-failed-disk-error",
      });

      return;
    }
  } else if (process.platform == "darwin" || process.platform == "linux") {
    // untar .tar.{gz,bz2}
    const lowerFname = dlFname.toLowerCase();
    const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
    console.log(
      "[player] Start to extract the tarball archive",
      dlPath,
      "to",
      playerPath,
    );
    win.webContents.send("update player extract progress", 50);

    try {
      await spawnPromise(
        "tar",
        [`xvf${bz2 ? "j" : "z"}`, dlPath, "-C", playerPath],
        { capture: ["stdout", "stderr"] },
      );
    } catch (e) {
      win.webContents.send("go to error page", "player", {
        url: "download-binary-failed-disk-error",
      });

      return;
    }
    console.log("The tarball archive", dlPath, "has extracted to ", playerPath);
  } else {
    console.warn("[player] Not supported platform.");
    return;
  }

  win.webContents.send("update player extract complete");
  console.log("[player] player extract complete.");
  await fs.promises.unlink(dlPath);
}

export function isUpdating() {
  const lockfilePath = getLockfilePath();
  return lockfile.checkSync(lockfilePath);
}

/**
 * unlock if lockfile locked.
 */
export function cleanUpLockfile() {
  const lockfilePath = getLockfilePath();
  if (lockfile.checkSync(lockfilePath)) {
    lockfile.unlockSync(lockfilePath);
  }
}

function getLockfilePath(): string {
  let lockfilePath: string;
  if (process.platform === "darwin")
    lockfilePath = path.join(path.dirname(app.getPath("userData")), "lockfile");
  else lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");
  return lockfilePath;
}
