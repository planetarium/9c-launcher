import fs, { readdirSync } from "fs";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract } from "../utils";
import path from "path";
import { BlockMetadata } from "src/interfaces/block-header";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import Headless from "./headless/headless";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { ClearCacheException } from "./exceptions/clear-cache-exception";
import { ExtractSnapshotFailedError } from "./exceptions/extract-snapshot-failed";
import { INineChroniclesMixpanel } from "./mixpanel";

export type Epoch = {
  BlockEpoch: number;
  TxEpoch: number;
};

export type DownloadStatus = {
  [name: string]: IDownloadProgress;
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
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel,
): Promise<Epoch[]> => {
  let localEpoch = getCurrentEpoch(storePath);
  let target: Epoch[] = [];

  mixpanel?.track(`Launcher/Downloading Snapshot/metadata`);

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
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel,
): Promise<string[]> {
  token.throwIfCancelled();
  console.log("Downloading snapshot.");
  console.log(target);
  let savingPaths: string[] = [];
  let progressDict: DownloadStatus = {};

  try {
    mixpanel?.track(`Launcher/Downloading Snapshot/snapshot`);

    let downloadPromise = target.map(async (x) => {
      let downloadTargetName = `snapshot-${x.BlockEpoch}-${x.TxEpoch}.zip`;
      let savingPath = path.join(userDataPath, `${downloadTargetName}`);
      console.log(`download snapshot path: ${basePath}/${downloadTargetName}`);
      await cancellableDownload(
        basePath + `/${downloadTargetName}`,
        savingPath,
        (status) => {
          progressDict[downloadTargetName] = status;
          const value = Object.values(progressDict);
          const progressSum = value.reduce((a, b) => a + b.transferredBytes, 0);
          const totalSum = value.reduce((a, b) => a + b.totalBytes, 0);
          status.percent = progressSum / totalSum;
          onProgress(status);
        },
        token
      );
      return savingPath;
    });
    savingPaths = await Promise.all(downloadPromise);
  } catch (error) {
    if (token.reason === "clear-cache") {
      throw new ClearCacheException();
    } else {
      console.error(error);
      throw new DownloadSnapshotFailedError(basePath, savingPaths.join(", "));
    }
  }

  token.throwIfCancelled();

  console.log("Snapshot download complete. Directory: ", userDataPath);
  return savingPaths;
}

export async function downloadStateSnapshot(
  basePath: string,
  userDataPath: string,
  onProgress: (status: IDownloadProgress) => void,
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel,
): Promise<string> {
  token.throwIfCancelled();
  const downloadTargetName = `state_latest.zip`;
  const savingPath = path.join(userDataPath, `${downloadTargetName}`);
  const downloadUrl = basePath + `/${downloadTargetName}`;
  console.log(`download snapshot path: ${downloadUrl}`);

  try {
    if (mixpanel !== null) {
      mixpanel?.track(`Launcher/Downloading Snapshot/state-snapshot`);
    }

    await cancellableDownload(downloadUrl, savingPath, onProgress, token);
  } catch (error) {
    if (token.reason === "clear-cache") {
      throw new ClearCacheException();
    } else {
      throw new DownloadSnapshotFailedError(basePath, savingPath);
    }
  }
  return savingPath;
}

export async function extractSnapshot(
  snapshotPaths: string[],
  blockchainStorePath: string,
  onProgress: (progress: number) => void,
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel,
): Promise<void> {
  snapshotPaths.reverse();
  let index = 0;

  try {
    if (mixpanel !== null) {
      mixpanel?.track(`Launcher/Downloading Snapshot/extract-snapshot`);
    }

    console.log(`Extracting snapshot.
  extractPath: [ ${blockchainStorePath} ],
  extractTarget: [ ${snapshotPaths} ]`);

    const snapshotPathsLength = snapshotPaths.length;
    const eachProgress = 1 / snapshotPathsLength;
    for (const snapshotPath of snapshotPaths) {
      const accumulateProgress = index * eachProgress;
      token.throwIfCancelled();
      console.log(`extract: ${snapshotPath}`);
      await cancellableExtract(
        snapshotPath,
        blockchainStorePath,
        (progress) =>
          onProgress(accumulateProgress + progress / snapshotPathsLength),
        token
      );
      index++;
    }
    onProgress(1);
    console.log("Snapshot extract complete.");

    if (mixpanel !== null) {
      mixpanel?.track(`Launcher/Downloading Snapshot/complete`);
    }
  } catch (error) {
    if (token.reason === "clear-cache") {
      throw new ClearCacheException();
    } else {
      throw new ExtractSnapshotFailedError(snapshotPaths[index]);
    }
  }
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
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel,
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
      token,
      mixpanel,
    );
    const snapshotPaths = await downloadSnapshot(
      snapshotDownloadUrl,
      target,
      userDataPath,
      (status) => {
        win?.webContents.send("download snapshot progress", status);
      },
      token,
      mixpanel,
    );
    const stateSnapshotPath = await downloadStateSnapshot(
      snapshotDownloadUrl,
      userDataPath,
      (status) => {
        win?.webContents.send("download state snapshot progress", status);
      },
      token,
      mixpanel,
    );
    snapshotPaths.push(stateSnapshotPath);
    removeUselessStore(storePath);
    await extractSnapshot(
      snapshotPaths,
      storePath,
      (progress: number) => {
        win?.webContents.send("extract progress", progress);
      },
      token,
      mixpanel,
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
