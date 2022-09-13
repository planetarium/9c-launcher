import path from "path";
import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import extractZip from "extract-zip";
import * as utils from "../../utils";
import { IDownloadProgress } from "src/interfaces/ipc";
import { tmpName } from "tmp-promise";
import { DownloadBinaryFailedError } from "../exceptions/download-binary-failed";
import { get as getConfig } from "../../config";
import fs from "fs";
import { spawn as spawnPromise } from "child-process-promise";
import { IUpdate } from "./check";
import { IUpdateOptions } from "./update";

export async function launcherUpdate(
  update: IUpdate,
  listeners: IUpdateOptions
) {
  if (!getConfig("UseUpdate", process.env.NODE_ENV === "production")) {
    console.log("`UseUpdate` option is false, Do not proceed update!");
    return;
  }

  const win = listeners.getWindow();

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  await listeners.downloadStarted();

  win?.webContents.send("update download started");
  // TODO: It would be nice to have a continuous download feature.
  const options: ElectronDLOptions = {
    onStarted: (downloadItem: DownloadItem) => {
      console.log("Starts to download:", downloadItem);
    },
    onProgress: (status: IDownloadProgress) => {
      const percent = (status.percent * 100) | 0;
      console.log(
        `Downloading ${update.urls.launcher}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
      );
      win?.webContents.send("update download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("Starts to download:", update.urls.launcher);
  let dl: DownloadItem | null | undefined;
  try {
    dl = await download(win, update.urls.launcher, options);
  } catch (error) {
    win.webContents.send("go to error page", "download-binary-failed");
    throw new DownloadBinaryFailedError(update.urls.launcher);
  }

  win.webContents.send("update download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("Finished to download:", dlPath);

  const extractPath =
    process.platform === "darwin" // we should check whether it was executed from .app or from yarn dev.
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

  if (process.platform === "win32") {
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
  } else if (process.platform === "darwin" || process.platform === "linux") {
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
}
