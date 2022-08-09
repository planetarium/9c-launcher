import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import path from "path";
import extractZip from "extract-zip";
import { spawn as spawnPromise } from "child-process-promise";


const playerTempPath = path.join(app.getPath("temp"), "player");
const extractPath = path.join(app.getPath("userData"), "player");

export async function playerUpdate(
  downloadUrl: string,
  win: Electron.BrowserWindow
) {
  win.webContents.send("start update player");

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

  win.webContents.send("update player download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("[player] Finished to download:", dlPath);
  console.log("[player] The 9C player installation path:", extractPath);

  if (process.platform == "win32") {
    // Unzip ZIP
    console.log("[player] Start to extract the zip archive", dlPath, "to", extractPath);

    await extractZip(dlPath, {
      dir: extractPath,
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
}
