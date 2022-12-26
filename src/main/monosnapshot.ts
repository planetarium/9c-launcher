import { app, BrowserWindow } from "electron";
import fs from "fs";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract, execute } from "src/utils";
import path from "path";
import { BlockMetadata } from "src/interfaces/block-header";
import Headless from "./headless/headless";
import * as utils from "src/utils";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import { ExtractSnapshotFailedError } from "./exceptions/extract-snapshot-failed";
import { ClearCacheException } from "./exceptions/clear-cache-exception";
import { INineChroniclesMixpanel } from "./mixpanel";
import { get, REQUIRED_DISK_SPACE } from "../config";

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

    const meta = await fs.promises.readFile(savingPath, "utf-8");
    console.log("Metadata download complete: ", meta);
    return JSON.parse(meta) as BlockMetadata;
  } catch (error) {
    throw new DownloadSnapshotMetadataFailedError(downloadPath, savingPath);
  }
}

/**
 * Determines if we should download the snapshots.
 * If this function retruns false, the headless will be launched immidiately.
 */
export function validateMetadata(
  localMetadata: BlockMetadata,
  snapshotMetadata: BlockMetadata
): boolean {
  return (
    snapshotMetadata.Index > localMetadata.Index + get("SnapshotThreshold")
  );
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
    if (token.reason === "clear-cache") {
      throw new ClearCacheException();
    } else {
      throw new DownloadSnapshotFailedError(downloadPath, savingPath);
    }
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
    if (token.reason === "clear-cache") {
      throw new ClearCacheException();
    } else {
      throw new ExtractSnapshotFailedError(snapshotPath);
    }
  }
}

export async function processSnapshot(
  snapshotDownloadUrl: string,
  storePath: string,
  userDataPath: string,
  standalone: Headless,
  win: Electron.BrowserWindow,
  token: CancellationToken,
  sizeCallback: (size: bigint) => void,
  mixpanelInfo?: INineChroniclesMixpanel
): Promise<boolean> {
  console.log(`Trying snapshot path: ${snapshotDownloadUrl}`);

  const localMetadata = standalone.getTip("monorocksdb", storePath);

  const snapshotMetadata = await downloadMetadata(
    snapshotDownloadUrl,
    win,
    token
  );
  const needSnapshot =
    localMetadata === null || validateMetadata(localMetadata, snapshotMetadata);
  if (needSnapshot) {
    await sizeCallback(REQUIRED_DISK_SPACE);
    const snapshotPath = await downloadSnapshot(
      snapshotDownloadUrl,
      (status) => {
        win?.webContents.send("download snapshot progress", status);
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
}
