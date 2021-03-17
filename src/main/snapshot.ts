import { BLOCKCHAIN_STORE_PATH } from "../config";
import { app, BrowserWindow } from "electron";
import fs from "fs";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract } from "../utils";
import path from "path";
import { BlockHeader } from "src/interfaces/block-header";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { ExtractSnapshotFailedError } from "./exceptions/extract-snapshot-failed";

export async function downloadMetadata(
  basePath: string,
  win: BrowserWindow,
  token: CancellationToken
): Promise<BlockHeader> {
  token.throwIfCancelled();
  console.log("Downloading metadata.");
  const downloadPath = basePath + ".json";
  const dir = app.getPath("userData");
  const savingPath = path.join(dir, "meta.json");

  try {
    let meta = await fs.promises.readFile(savingPath, "utf-8");
    console.log("Metadata download complete: ", meta);
    return JSON.parse(meta) as BlockHeader;
  }
  catch (error) {
    throw new DownloadSnapshotMetadataFailedError(downloadPath, savingPath);
  }
}

export function validateMetadata(
  localMetadata: BlockHeader,
  snapshotMetadata: BlockHeader
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
  }
  catch (error) {
    throw new DownloadSnapshotFailedError(downloadPath, savingPath);
  }
}

export async function extractSnapshot(
  snapshotPath: string,
  onProgress: (progress: number) => void,
  token: CancellationToken
): Promise<void> {
  try {
    token.throwIfCancelled();
    console.log(`Extracting snapshot.
extractPath: [ ${BLOCKCHAIN_STORE_PATH} ],
extractTarget: [ ${snapshotPath} ]`);
    await cancellableExtract(
      snapshotPath,
      BLOCKCHAIN_STORE_PATH,
      onProgress,
      token
    );
    console.log("Snapshot extract complete.");
  }
  catch (error) {
    throw new ExtractSnapshotFailedError(snapshotPath);
  }
}
