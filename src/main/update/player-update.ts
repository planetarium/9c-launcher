import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import { IDownloadProgress } from "src/interfaces/ipc";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import path from "path";
import { IUpdateOptions } from "./launcher-update"
import { macExtract, winExtract } from "./extract";

const playerTempPath = path.join(app.getPath("temp"), "player");
const extractPath = path.join(app.getPath("userData"), "player");


export async function playerUpdate(downloadUrl: string, listeners: IUpdateOptions) {
  const win = listeners.getWindow();

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  win?.webContents.send("update download started");
  
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
  console.log("[player] The 9C player installation path:", extractPath);

  if (process.platform == "win32") {
    await winExtract(dlPath, extractPath, win);
  } else if (process.platform == "darwin") {
    await macExtract(dlPath, extractPath, dlFname);
  } else {
    console.warn("[player] Not supported platform.");
    return;
  }
}

