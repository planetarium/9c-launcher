import { DownloadItem, app, contextBridge } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import path from "path";
import fs from "fs";
import extractZip from "extract-zip";
import { spawn as spawnPromise } from "child-process-promise";
import { playerPath } from "../../config";
import lockfile from "lockfile";
import { createVersionMetafile } from "./metafile";
import { IUpdateContext } from "./check";

const lockfilePath = path.join(
  path.dirname(app.getPath("exe")),
  "player-lockfile"
);

export async function playerUpdate(
  context: IUpdateContext,
  win: Electron.BrowserWindow | null
) {
  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  if (lockfile.checkSync(lockfilePath)) {
    console.log(
      "[player] 'encounter different version' event seems running already. Stop this flow."
    );
    return;
  }

  try {
    lockfile.lockSync(lockfilePath);
    console.log(
      "[player] Created 'encounter different version' lockfile at ",
      lockfilePath
    );
  } catch (e) {
    console.error("[player] Error occurred during trying lock.");
    throw e;
  }

  win.webContents.send("update player download started");

  // TODO: It would be nice to have a continuous download feature.
  const options: ElectronDLOptions = {
    onStarted: (downloadItem: DownloadItem) => {
      console.log("[player] Starts to download:", downloadItem);
    },
    onProgress: (status: IDownloadProgress) => {
      const percent = (status.percent * 100) | 0;
      console.log(
        `[player] Downloading ${context.urls.player}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
      );
      win?.webContents.send("update player download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("[player] Starts to download:", context.urls.player);
  let dl: DownloadItem | null | undefined;
  try {
    dl = await download(win, context.urls.player, options);
  } catch (error) {
    win.webContents.send("go to error page", "download-binary-failed");
    throw new DownloadBinaryFailedError(context.urls.player);
  }

  win.webContents.send("update player download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("[player] Finished to download:", dlPath);

  const playerDirExists = await fs.promises.stat(playerPath).catch(() => false);
  if (playerDirExists) await fs.promises.rmdir(playerPath, { recursive: true });

  await fs.promises.mkdir(playerPath, { recursive: true });

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
        win.webContents.send("update player extract progress", progress);
      },
    });
  } else if (process.platform == "darwin" || process.platform == "linux") {
    // untar .tar.{gz,bz2}
    const lowerFname = dlFname.toLowerCase();
    const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
    console.log(
      "[player] Start to extract the tarball archive",
      dlPath,
      "to",
      playerPath
    );
    win?.webContents.send("update player extract progress", 50);

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
  win.webContents.send("update player extract complete");

  await fs.promises.unlink(dlPath);

  await createVersionMetafile(playerPath, {
    apvVersion: context.newApv.version,
    timestamp: new Date().toISOString(),
  });

  lockfile.unlockSync(lockfilePath);
  console.log(
    "[player] Removed 'encounter different version' lockfile at ",
    lockfilePath
  );
}
