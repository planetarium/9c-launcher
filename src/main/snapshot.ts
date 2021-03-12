import { BLOCKCHAIN_STORE_PATH, LOCAL_SERVER_PORT } from "../config";
import { app, BrowserWindow } from "electron";
import fs from "fs";
import { retry } from "@lifeomic/attempt";
import { request, gql, ClientError } from "graphql-request";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract, execute } from "../utils";
import path from "path";
import { BlockHeader } from "src/interfaces/block-header";

export async function downloadMetadata(
  basePath: string,
  win: BrowserWindow,
  token: CancellationToken
): Promise<BlockHeader> {
  token.throwIfCancelled();
  console.log("Downloading metadata.");
  const dir = app.getPath("userData");
  const savingPath = path.join(dir, "meta.json");
  await cancellableDownload(basePath + ".json", savingPath, (_) => {}, token);
  token.throwIfCancelled();

  let meta = await fs.promises.readFile(savingPath, "utf-8");
  console.log("Metadata download complete: ", meta);
  return JSON.parse(meta) as BlockHeader;
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
  const dir = app.getPath("userData");
  const savingPath = path.join(dir, "snapshot.zip");
  await cancellableDownload(basePath + ".zip", savingPath, onProgress, token);
  token.throwIfCancelled();
  console.log("Snapshot download complete. Directory: ", dir);
  return savingPath;
}

export async function extractSnapshot(
  snapshotPath: string,
  onProgress: (progress: number) => void,
  token: CancellationToken
): Promise<void> {
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
