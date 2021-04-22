import fs, { readdirSync } from "fs";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress, IExtractProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract } from "../utils";
import path from "path";
import { BlockMetadata } from "src/interfaces/block-header";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import Headless from "./headless/headless";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { MixpanelInfo } from "./main";

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
  mixpanelInfo: MixpanelInfo,
  token: CancellationToken
): Promise<Epoch[]> => {
  let localEpoch = getCurrentEpoch(storePath);
  let target: Epoch[] = [];
  let mixpanel = mixpanelInfo.mixpanel;
  let mixpanelUUID = mixpanelInfo.mixpanelUUID;
  let ip = mixpanelInfo.ip;

  if (mixpanel !== null) {
    mixpanel?.track(`Launcher/Downloading Snapshot/metadata`, {
      distinct_id: mixpanelUUID,
      ip,
    });
  }

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
  mixpanelInfo: MixpanelInfo,
  token: CancellationToken
): Promise<string[]> {
  token.throwIfCancelled();
  console.log("Downloading snapshot.");
  console.log(target);
  let savingPaths: string[] = [];
  let progressDict: DownloadStatus = {};
  let mixpanel = mixpanelInfo.mixpanel;
  let mixpanelUUID = mixpanelInfo.mixpanelUUID;
  let ip = mixpanelInfo.ip;

  try {
    if (mixpanel !== null) {
      mixpanel?.track(`Launcher/Downloading Snapshot/snapshot`, {
        distinct_id: mixpanelUUID,
        ip,
      });
    }

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
    savingPaths = await Promise.all(downloadPromise);
  } catch (error) {
    throw new DownloadSnapshotFailedError(basePath, savingPaths.join(", "));
  }

  token.throwIfCancelled();

  console.log("Snapshot download complete. Directory: ", userDataPath);
  return savingPaths;
}

export async function downloadStateSnapshot(
  basePath: string,
  userDataPath: string,
  onProgress: (status: IDownloadProgress) => void,
  mixpanelInfo: MixpanelInfo,
  token: CancellationToken
): Promise<string> {
  token.throwIfCancelled();
  const downloadTargetName = `state_latest.zip`;
  const savingPath = path.join(userDataPath, `${downloadTargetName}`);
  const downloadUrl = basePath + `/${downloadTargetName}`;
  let mixpanel = mixpanelInfo.mixpanel;
  let mixpanelUUID = mixpanelInfo.mixpanelUUID;
  let ip = mixpanelInfo.ip;
  console.log(`download snapshot path: ${downloadUrl}`);

  if (mixpanel !== null) {
    mixpanel?.track(`Launcher/Downloading Snapshot/state-snapshot`, {
      distinct_id: mixpanelUUID,
      ip,
    });
  }

  await cancellableDownload(downloadUrl, savingPath, onProgress, token);
  return savingPath;
}

export async function extractSnapshot(
  snapshotPaths: string[],
  blockchainStorePath: string,
  onProgress: (progress: IExtractProgress) => void,
  mixpanelInfo: MixpanelInfo,
  token: CancellationToken
): Promise<void> {
  let savingPaths: string[] = [];
  let progressDict: DownloadStatus = {};
  let mixpanel = mixpanelInfo.mixpanel;
  let mixpanelUUID = mixpanelInfo.mixpanelUUID;
  let ip = mixpanelInfo.ip;
  snapshotPaths.reverse();

  if (mixpanel !== null) {
    mixpanel?.track(`Launcher/Downloading Snapshot/extract-snapshot`, {
      distinct_id: mixpanelUUID,
      ip,
    });
  }

  console.log(`Extracting snapshot.
extractPath: [ ${blockchainStorePath} ],
extractTarget: [ ${snapshotPaths} ]`);

  let downloadPromise = snapshotPaths.map(async (snapshotPath) => {
    token.throwIfCancelled();
    console.log(`extract: ${snapshotPath}`);
    await cancellableExtract(
      snapshotPath,
      blockchainStorePath,
      (progress) => {
        progressDict[snapshotPath] = {
          percent: progress.percent,
        };
        const value = Object.values(progressDict);
        const sum = value.reduce((a, b) => a + b.percent, 0);
        progress.percent = sum / snapshotPaths.length;
        onProgress(progress);
      },
      token
    );
    return blockchainStorePath;
  });
  savingPaths = await Promise.all(downloadPromise);
  console.log("Snapshot extract complete.");

  if (mixpanel !== null) {
    mixpanel?.track(`Launcher/Downloading Snapshot/complete`, {
      distinct_id: mixpanelUUID,
      ip,
    });
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
  mixpanelInfo: MixpanelInfo,
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
      mixpanelInfo,
      token
    );
    const snapshotPaths = await downloadSnapshot(
      snapshotDownloadUrl,
      target,
      userDataPath,
      (status) => {
        win?.webContents.send("download snapshot progress", status);
      },
      mixpanelInfo,
      token
    );
    const stateSnapshotPath = await downloadStateSnapshot(
      snapshotDownloadUrl,
      userDataPath,
      (status) => {
        win?.webContents.send("download state snapshot progress", status);
      },
      mixpanelInfo,
      token
    );
    snapshotPaths.push(stateSnapshotPath);
    removeUselessStore(storePath);
    await extractSnapshot(
      snapshotPaths,
      storePath,
      (progress) => {
        win?.webContents.send("extract progress", progress);
      },
      mixpanelInfo,
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
