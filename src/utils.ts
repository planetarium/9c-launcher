import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import checkDiskSpace from "check-disk-space";
import path from "path";
import fs from "fs";
import axios, { AxiosError } from "axios";
import * as rax from "retry-axios";
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

export const downloadAxios = axios.create({
  responseType: "stream",
  raxConfig: {
    retry: 5, // number of retry when facing 400 or 500
    onRetryAttempt(err) {
      const cfg = rax.getConfig(err);
      console.log(`Retry attempt #${cfg?.currentRetryAttempt}`); // track current trial
    },
  },
});

downloadAxios.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 412 || err.response?.status === 416) {
      // Precondition Failed (ETag doesn't match)
      // Range Not Satisfiable (Range header invalid) -- This happens if done wasn't marked properly or the file is damaged.
      delete err.config.headers["Range"];
      delete err.config.headers["If-Match"];
      err.config.onETagFailed?.(err);
      return downloadAxios.request(err.config);
    }
    return Promise.reject(err);
  }
);

declare module "axios" {
  export interface AxiosRequestConfig {
    /**
     * If the ETag doesn't match, calls this function after removing headers.
     * It will be ignored unless you're using `downloadAxios`.
     */
    onETagFailed?(err: AxiosError): void;
  }
}

rax.attach(downloadAxios);

interface DownloadMetadata {
  etag: string;
  complete?: boolean;
}

export async function cancellableDownload(
  url: string,
  downloadPath: string,
  onProgress: (arg0: IDownloadProgress) => void,
  token: CancellationToken,
  partial: boolean = true
): Promise<void> {
  const metaFilePath = `${downloadPath}.meta`;

  try {
    const metadata: DownloadMetadata | false =
      partial &&
      fs.existsSync(metaFilePath) &&
      JSON.parse(fs.readFileSync(metaFilePath).toString());
    let startingBytes =
      metadata && fs.existsSync(downloadPath) && fs.statSync(downloadPath).size;
    const headers =
      metadata && startingBytes
        ? {
            Range: `bytes=${startingBytes}-`,
            "If-Match": metadata.etag,
          }
        : undefined;

    const axiosCts = axios.CancelToken.source();
    token.onCancelled((_) => axiosCts.cancel());

    // Remove invalid or non-partial download fragments.
    if (!metadata && fs.existsSync(downloadPath))
      await fs.promises.unlink(downloadPath);

    if (metadata && metadata.complete) {
      // Returns 304 if not changed
      const res = await downloadAxios.head(url, {
        cancelToken: axiosCts.token,
        headers: {
          "If-None-Match": metadata.etag,
        },
        validateStatus(status) {
          return status === 304 || (status >= 200 && status < 300);
        },
      });
      if (res.status === 304) {
        console.log("Found a complete copy of ", downloadPath);
        return;
      }

      // After this, invalidation will happen at onETagFailed below.
    }

    if (metadata) console.log("meta available ", downloadPath);

    const res = await downloadAxios.get(url, {
      cancelToken: axiosCts.token,
      headers,
      onETagFailed() {
        // header will be edited by the interceptor
        startingBytes = false;
        if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
        fs.unlinkSync(metaFilePath);
        console.log("meta invalidated ", downloadPath);
      },
    });

    if (partial)
      await fs.promises.writeFile(
        metaFilePath,
        JSON.stringify({ etag: res.headers.etag })
      );

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

    await pipeline(
      res.data,
      fs.createWriteStream(downloadPath, { flags: "a" })
    );
    if (partial)
      await fs.promises.writeFile(
        metaFilePath,
        JSON.stringify({ etag: res.headers.etag, complete: true })
      );
    console.log("Complete: ", url);
  } catch (error) {
    console.error("Download failed: ", error);
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

    // After extraction, remove meta file to prevent triggering continuous downloading behaviour.
    const metaFile = targetDir.concat(".meta");
    if (fs.existsSync(metaFile)) await fs.promises.unlink(metaFile);
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
