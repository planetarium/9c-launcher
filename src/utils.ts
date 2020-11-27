import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import checkDiskSpace from "check-disk-space";
import path from "path";
import fs from "fs";
import { BrowserWindow, DownloadItem } from "electron";
import { IDownloadOptions } from "./interfaces/ipc";
import CancellationToken from "cancellationtoken";
import { download } from "electron-dl";
import extractZip from "extract-zip";

export async function getDiskSpace(diskpath: string): Promise<number> {
  let diskSpace = await checkDiskSpace(diskpath);
  return diskSpace.free;
}

export function isDiskPermissionValid(diskpath: string): boolean {
  try {
    if (!fs.existsSync(diskpath)) {
      console.log("Create directory for given blockchain path.");
      fs.mkdirSync(diskpath, { recursive: true });
    }
  } catch (err) {
    console.error("Error occurred while creating directory.", err);
    if (err.code === "EACCES" || err.code === "EPERM") return false;
  }

  try {
    fs.accessSync(diskpath, fs.constants.F_OK);
    return true;
  } catch (err) {
    console.error("No read/write access to the path: ", diskpath, err);
    return false;
  }
}

export function deleteBlockchainStoreSync(storepath: string): void {
  console.log("Deleting blockchain store.");
  fs.rmdirSync(storepath, { recursive: true });
}

export function execute(
  binarypath: string,
  args: string[]
): ChildProcessWithoutNullStreams {
  if (binarypath == "") {
    throw Error("Path is empty.");
  }

  const node = spawn(binarypath, args);
  node.stdout?.on("data", (data) => {
    console.log(`${data}`);
  });
  node.stderr?.on("data", (data) => {
    console.log(`${data}`);
  });
  return node;
}

export async function copyDir(srcDir: string, dstDir: string): Promise<void> {
  try {
    const stat = await fs.promises.stat(dstDir);

    if (!stat.isDirectory()) {
      await fs.promises.unlink(dstDir);
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  }

  for (const ent of await fs.promises.readdir(srcDir, {
    withFileTypes: true,
  })) {
    const src = path.join(srcDir, ent.name);
    const dst = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      await copyDir(src, dst);
    } else {
      try {
        await fs.promises.copyFile(src, dst);
      } catch (e) {
        console.warn("Failed to copy a file", src, "->", dst, ":\n", e);
      }
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cancellableDownload(
  win: BrowserWindow,
  url: string,
  options: IDownloadOptions,
  token: CancellationToken
): Promise<DownloadItem> {
  return new Promise((resolve, reject) => {
    options.properties.onStarted = async (item: DownloadItem) => {
      let unregister: () => void = () => {};
      item.once("done", (event, state) => {
        unregister();
        if (state === "completed") {
          resolve(item);
        } else {
          console.log(`Download failed: ${state}`);
        }
      });
      unregister = token.onCancelled((_) => item.cancel());
    };
    options.properties.onCancel = async (item: DownloadItem) => {
      console.log(`Download of ${url} is cancelled.`);
      reject(new CancellationToken.CancellationError(token.reason));
    };
    download(win, url, options.properties);
  });
}

export async function cancellableExtract(
  targetDir: string,
  outputDir: string,
  onProgress: (progress: number) => void,
  token: CancellationToken
): Promise<void> {
  try {
    await extractZip(targetDir, {
      dir: outputDir,
      onEntry: (_, zipfile) => {
        if (token.isCancelled) {
          console.log(`Extraction for ${targetDir} is cancelled.`);
          zipfile.close();
        }
        const progress = zipfile.entriesRead / zipfile.entryCount;
        onProgress(progress);
      },
    });
  } catch (error) {
    console.log(
      `Unexpected error occurred during extracting ${targetDir} to ${outputDir}`
    );
  } finally {
    fs.unlinkSync(targetDir);
    token.throwIfCancelled();
  }
}
