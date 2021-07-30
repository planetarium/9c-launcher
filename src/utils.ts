import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import checkDiskSpace from "check-disk-space";
import path from "path";
import fs from "fs";
import axios from "axios";
import * as rax from 'retry-axios';
import stream from "stream";
import { promisify } from "util";
import { IDownloadProgress } from "./interfaces/ipc";
import CancellationToken from "cancellationtoken";
import extractZip from "extract-zip";
import { CancellableDownloadFailedError } from "./main/exceptions/cancellable-download-failed";
import { CancellableExtractFailedError } from "./main/exceptions/cancellable-extract-failed";

const pipeline = promisify(stream.pipeline);

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

export async function cancellableDownload(
  url: string,
  downloadPath: string,
  onProgress: (arg0: IDownloadProgress) => void,
  token: CancellationToken
): Promise<void> {
  try {
    const axiosCts = axios.CancelToken.source();
    token.onCancelled((_) => axiosCts.cancel());

    rax.attach();
    const res = await axios(url, {
      cancelToken: axiosCts.token,
      method: "get",
      responseType: "stream",
      raxConfig: {
        retry: 5, // number of retry when facing 400 or 500
        onRetryAttempt: err => {
          const cfg = rax.getConfig(err);
          console.log(`Retry attempt #${cfg?.currentRetryAttempt}`); // track current trial
        }
      }
    });
    const totalBytes = parseInt(res.headers["content-length"]);
    let transferredBytes: number = 0;
    res.data.on("data", (chunk: string | any[]) => {
      transferredBytes += chunk.length;
      onProgress({
        totalBytes,
        percent: transferredBytes / totalBytes,
        transferredBytes,
      });
    });
    await pipeline(res.data, fs.createWriteStream(downloadPath));
  } catch (error) {
    throw new CancellableDownloadFailedError(url, downloadPath);
  }
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
    await fs.promises.unlink(targetDir);
  } catch (error) {
    console.error(
      `Unexpected error occurred during extracting ${targetDir} to ${outputDir}. ${error}`
    );
    throw new CancellableExtractFailedError(targetDir, outputDir);
  }
}

export function getType(target: any) {
  return Object.prototype.toString.call(target).slice(8, -1);
}
