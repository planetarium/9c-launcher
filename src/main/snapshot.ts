import fs, { readdirSync } from "fs";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract } from "../utils";
import path from "path";
import { BlockMetadata } from "src/interfaces/block-header";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import Headless from "./headless";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";

export type Epoch = {
  BlockEpoch: number;
  TxEpoch: number;
};

export type DownloadStatus = {
  [name: string]: {
    percent: number;
  };
};

export const getCurrentEpoch = (storePath: string): Epoch => {
  const getEpochList = (storePath: string) =>
    readdirSync(storePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .map((dirname) => parseInt(dirname.substring(5)))
      .filter((epoch) => !isNaN(epoch));

  try {
    let currentBlockEpoch = Math.max.apply(
      null,
      getEpochList(path.join(storePath, "block"))
    );
    let currentTxEpoch = Math.max.apply(
      null,
      getEpochList(path.join(storePath, "tx"))
    );
    return {
      BlockEpoch: isFinite(currentBlockEpoch) ? currentBlockEpoch : 0,
      TxEpoch: isFinite(currentTxEpoch) ? currentTxEpoch : 0,
    };
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Empty store");
      return {
        BlockEpoch: 0,
        TxEpoch: 0,
      };
    }
    throw err;
  }
};

export const getSnapshotDownloadTarget = async (
  metadata: BlockMetadata,
  storePath: string,
  basePath: string,
  userDataPath: string,
  token: CancellationToken
): Promise<Epoch[]> => {
  let localEpoch = getCurrentEpoch(storePath);
  let target: Epoch[] = [];

  while (true) {
    token.throwIfCancelled();

    let checkEpochRange =
      localEpoch["BlockEpoch"] > metadata["BlockEpoch"] &&
      localEpoch["TxEpoch"] > metadata["TxEpoch"];

    if (checkEpochRange) break;

    target.push({
      BlockEpoch: metadata["BlockEpoch"],
      TxEpoch: metadata["TxEpoch"],
    });

    let checkSnapshotIsGenesis =
      metadata["PreviousBlockEpoch"] === 0 && metadata["PreviousTxEpoch"] === 0;

    if (checkSnapshotIsGenesis) break;

    let downloadTargetName = `snapshot-${metadata["PreviousBlockEpoch"]}-${metadata["PreviousTxEpoch"]}.json`;
    metadata = await downloadMetadata(
      basePath,
      userDataPath,
      downloadTargetName,
      token
    );
  }

  return target;
};

export async function downloadMetadata(
  basePath: string,
  userDataPath: string,
  downloadFileName: string,
  token: CancellationToken
): Promise<BlockMetadata> {
  token.throwIfCancelled();
  const savingPath = path.join(userDataPath, downloadFileName);
  const downloadPath = basePath + "/" + downloadFileName;
  await cancellableDownload(downloadPath, savingPath, (_) => {}, token);
  token.throwIfCancelled();

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
  snapshotMetadata: BlockMetadata,
  localMetadata: BlockMetadata,
  blockchainStorePath: string,
  token: CancellationToken
): boolean {
  console.log(
    `current tip: #${localMetadata?.Index}, snapshot tip: #${snapshotMetadata.Index}`
  );
  return snapshotMetadata.Index > localMetadata?.Index;
}

export async function downloadSnapshot(
  basePath: string,
  target: Epoch[],
  userDataPath: string,
  onProgress: (status: IDownloadProgress) => void,
  token: CancellationToken
): Promise<string[]> {
  token.throwIfCancelled();
  console.log("Downloading snapshot.");
  console.log(target);
  let progressDict: DownloadStatus = {};
  let downloadPromise = target.map(async (x) => {
    let downloadTargetName = `snapshot-${x.BlockEpoch}-${x.TxEpoch}.zip`;
    let savingPath = path.join(userDataPath, `${downloadTargetName}`);
    console.log(`download snapshot path: ${basePath}/${downloadTargetName}`);
    await cancellableDownload(
      basePath + `/${downloadTargetName}`,
      savingPath,
      (status) => {
        progressDict[downloadTargetName] = {
          percent: status.percent,
        };
        const value = Object.values(progressDict);
        const sum = value.reduce((a, b) => a + b.percent, 0);
        status.percent = sum / target.length;
        onProgress(status);
      },
      token
    );
    return savingPath;
  });
  let savingPaths = await Promise.all(downloadPromise);
  token.throwIfCancelled();
  console.log("Snapshot download complete. Directory: ", userDataPath);
  return savingPaths;
}

export async function downloadStateSnapshot(
  basePath: string,
  userDataPath: string,
  onProgress: (status: IDownloadProgress) => void,
  token: CancellationToken
): Promise<string> {
  token.throwIfCancelled();
  const downloadTargetName = `state_latest.zip`;
  const savingPath = path.join(userDataPath, `${downloadTargetName}`);
  const downloadUrl = basePath + `/${downloadTargetName}`;
  console.log(`download snapshot path: ${downloadUrl}`);
  await cancellableDownload(downloadUrl, savingPath, onProgress, token);
  return savingPath;
}

export async function extractSnapshot(
  snapshotPaths: string[],
  blockchainStorePath: string,
  onProgress: (progress: number) => void,
  token: CancellationToken
): Promise<void> {
  snapshotPaths.reverse();

  console.log(`Extracting snapshot.
extractPath: [ ${blockchainStorePath} ],
extractTarget: [ ${snapshotPaths} ]`);
  for (const snapshotPath of snapshotPaths) {
    token.throwIfCancelled();
    console.log(`extract: ${snapshotPath}`);
    await cancellableExtract(
      snapshotPath,
      blockchainStorePath,
      onProgress,
      token
    );
  }
  console.log("Snapshot extract complete.");
}

export function removeUselessStore(blockchainStorePath: string): void {
  let listOfUselessDb = [
    "9c-main",
    "chain",
    "stagedtx",
    "state_hashes",
    "stateref",
    "states",
    path.join("block", "blockindex"),
    path.join("tx", "txindex"),
  ];

  listOfUselessDb.forEach((db) => {
    console.log(`Remove ${path.join(blockchainStorePath, db)}`);
    fs.rmdirSync(path.join(blockchainStorePath, db), { recursive: true });
  });
}

export async function processSnapshot(
  snapshotDownloadUrl: string,
  storePath: string,
  userDataPath: string,
  standalone: Headless,
  win: Electron.BrowserWindow,
  token: CancellationToken
): Promise<boolean> {
  console.log(`Trying snapshot path: ${snapshotDownloadUrl}`);

  const localMetadata = standalone.getTip("rocksdb", storePath);

  const snapshotMetadata = await downloadMetadata(
    snapshotDownloadUrl,
    userDataPath,
    "latest.json",
    token
  );
  const needSnapshot =
    localMetadata === null ||
    validateMetadata(snapshotMetadata, localMetadata, storePath, token);
  if (needSnapshot) {
    const target = await getSnapshotDownloadTarget(
      snapshotMetadata,
      storePath,
      snapshotDownloadUrl,
      userDataPath,
      token
    );
    const snapshotPaths = await downloadSnapshot(
      snapshotDownloadUrl,
      target,
      userDataPath,
      (status) => {
        win?.webContents.send("download progress", status);
      },
      token
    );
    const stateSnapshotPath = await downloadStateSnapshot(
      snapshotDownloadUrl,
      userDataPath,
      (status) => {
        win?.webContents.send("download progress", status);
      },
      token
    );
    snapshotPaths.push(stateSnapshotPath);
    removeUselessStore(storePath);
    await extractSnapshot(
      snapshotPaths,
      storePath,
      (progress: number) => {
        win?.webContents.send("extract progress", progress);
      },
      token
    );
  } else {
    console.log(
      `Metadata ${JSON.stringify(
        snapshotMetadata
      )} is redundant. Skip snapshot.`
    );
  }
  return true;
}
