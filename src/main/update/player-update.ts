import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import fs from "fs";
import extractZip from "extract-zip";
import { spawn as spawnPromise } from "child-process-promise";
import { IUpdate } from "./check";
import { configStore, playerPath, PLAYER_METAFILE_VERSION } from "src/config";
import { createVersion } from "./metafile";
import { getAvailableDiskSpace } from "src/utils/file";

export async function playerUpdate(
  update: IUpdate,
  win: Electron.BrowserWindow
) {
  console.log("Start player update", update.projects.player);
  win.webContents.send("update player download started");

  const available = await getAvailableDiskSpace(app.getPath("temp"));

  // TODO: It would be nice to have a continuous download feature.
  const options: ElectronDLOptions = {
    onStarted: (downloadItem: DownloadItem) => {
      const totalBytes = downloadItem.getTotalBytes();
      const totalKB = totalBytes / 1024;

      if (totalKB > available) {
        win.webContents.send("go to error page", "player", {
          size: totalBytes,
          url: "download-binary-failed-disk-error",
        });
        downloadItem.cancel();

        return;
      }

      console.log("[player] Starts to download:", downloadItem);
    },
    onProgress: (status: IDownloadProgress) => {
      const percent = (status.percent * 100) | 0;
      console.log(
        `[player] Downloading ${update.projects.player.url}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
      );
      win.webContents.send("update player download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("[player] Starts to download:", update.projects.player.url);
  let dl: DownloadItem | null | undefined;
  try {
    dl = await download(win, update.projects.player.url, options);
  } catch (error) {
    win.webContents.send("go to error page", "download-binary-failed");
    throw new DownloadBinaryFailedError(update.projects.player.url);
  }

  win.webContents.send("update player download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("[player] Finished to download:", dlPath);

  const exists = await fs.promises.stat(playerPath).catch(() => false);

  if (exists) {
    await fs.promises.rmdir(playerPath, { recursive: true });
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
      playerPath
    );

    try {
      await extractZip(dlPath, {
        dir: playerPath,
        onEntry: (_, zipfile) => {
          const progress = zipfile.entriesRead / zipfile.entryCount;
          win.webContents.send("update player extract progress", progress);
        },
      });
    } catch (e) {
      win.webContents.send("go to error page", "player", {
        size: e.size,
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
      playerPath
    );
    win.webContents.send("update player extract progress", 50);

    try {
      await spawnPromise(
        "tar",
        [`xvf${bz2 ? "j" : "z"}`, dlPath, "-C", playerPath],
        { capture: ["stdout", "stderr"] }
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

  update.projects.launcher.updateRequired
    ? win.webContents.send("update download started")
    : win.webContents.send("update player extract complete");

  await fs.promises.unlink(dlPath);

  if (
    !update.projects.launcher.updateRequired &&
    update.projects.player.updateRequired
  ) {
    configStore.set("AppProtocolVersion", update.newApv.raw);
  }

  await createVersion(playerPath, {
    apvVersion: update.newApv.version,
    projectVersion: update.projects.player.projectVersion,
    timestamp: new Date().toISOString(),
    schemaVersion: PLAYER_METAFILE_VERSION,
  });
}
