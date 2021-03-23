import { app, BrowserWindow } from "electron";
import fs from "fs";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract, execute } from "../utils";
import path from "path";
import { BlockMetadata } from "src/interfaces/block-header";
import Standalone from "./standalone";
import * as utils from "../utils";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import { ExtractSnapshotFailedError } from "./exceptions/extract-snapshot-failed";

export async function downloadMetadata(
  basePath: string,
  win: BrowserWindow,
  token: CancellationToken
): Promise<BlockMetadata> {
  token.throwIfCancelled();
  console.log("Downloading metadata.");
  const downloadPath = basePath + ".json";
  const dir = app.getPath("userData");
  const savingPath = path.join(dir, "meta.json");

  try {
    await cancellableDownload(downloadPath, savingPath, (_) => {}, token);
    token.throwIfCancelled();

    let meta = await fs.promises.readFile(savingPath, "utf-8");
    console.log("Metadata download complete: ", meta);
    return JSON.parse(meta) as BlockMetadata;
  } catch (error) {
    throw new DownloadSnapshotMetadataFailedError(downloadPath, savingPath);
  }
}

export function validateMetadata(
  localMetadata: BlockMetadata,
  snapshotMetadata: BlockMetadata
): boolean {
  return snapshotMetadata.Index > localMetadata.Index;
}

export async function downloadSnapshot(
  basePath: string,
  onProgress: (status: IDownloadProgress) => void,
  token: CancellationToken
): Promise<string> {
  token.throwIfCancelled();
  console.log("Downloading snapshot.");
  const downloadPath = basePath + ".zip";
  const dir = app.getPath("userData");
  const savingPath = path.join(dir, "snapshot.zip");

  try {
    await cancellableDownload(downloadPath, savingPath, onProgress, token);
    token.throwIfCancelled();
    console.log("Snapshot download complete. Directory: ", dir);
    return savingPath;
  } catch (error) {
    throw new DownloadSnapshotFailedError(downloadPath, savingPath);
  }
}

export async function extractSnapshot(
  snapshotPath: string,
  storePath: string,
  onProgress: (progress: number) => void,
  token: CancellationToken
): Promise<void> {
  try {
    token.throwIfCancelled();
    console.log(`Extracting snapshot.
extractPath: [ ${storePath} ],
extractTarget: [ ${snapshotPath} ]`);
    await cancellableExtract(snapshotPath, storePath, onProgress, token);
    console.log("Snapshot extract complete.");
  } catch (error) {
    throw new ExtractSnapshotFailedError(snapshotPath);
  }
}

export async function processSnapshot(
  snapshotDownloadUrl: string,
  storePath: string,
  userDataPath: string,
  standalone: Standalone,
  win: Electron.BrowserWindow,
  token: CancellationToken
): Promise<boolean> {
  console.log(`Trying snapshot path: ${snapshotDownloadUrl}`);

  const localMetadata = standalone.getTip("monorocksdb", storePath);

  try {
    let snapshotMetadata = await downloadMetadata(
      snapshotDownloadUrl,
      win,
      token
    );
    let needSnapshot =
      localMetadata === null ||
      validateMetadata(localMetadata, snapshotMetadata);
    if (needSnapshot) {
      let snapshotPath = await downloadSnapshot(
        snapshotDownloadUrl,
        (status) => {
          win?.webContents.send("download progress", status);
        },
        token
      );
      utils.deleteBlockchainStoreSync(storePath);
      await extractSnapshot(
        snapshotPath,
        storePath,
        (progress: number) => {
          win?.webContents.send("extract progress", progress);
        },
        token
      );
    } else {
      console.log(`Metadata ${snapshotMetadata} is redundant. Skip snapshot.`);
    }
    return true;
  } catch (error) {
    const errorMessage = `Unexpected error occurred during download / extract snapshot.\n${error}`;
    console.error(errorMessage);

    if (error instanceof DownloadSnapshotFailedError) {
      win?.webContents.send(
        "go to error page",
        "download-snapshot-failed-error"
      );
    } else if (error instanceof DownloadSnapshotMetadataFailedError) {
      win?.webContents.send(
        "go to error page",
        "download-snapshot-metadata-failed-error"
      );
    } else {
      // FIXME: use correct page
      win?.webContents.send(
        "go to error page",
        "download-snapshot-failed-error"
      );
    }
    return false;
  }
}
