import fs, { readdirSync } from "fs";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract } from "src/utils";
import path from "path";
import { BlockMetadata } from "src/interfaces/block-header";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import Headless from "./headless/headless";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { ClearCacheException } from "./exceptions/clear-cache-exception";
import { ExtractSnapshotFailedError } from "./exceptions/extract-snapshot-failed";
import { INineChroniclesMixpanel } from "./mixpanel";
import axios from "axios";
import { send } from "./ipc";
import { IPC_PRELOAD_NEXT, IPC_SNAPSHOT_PROGRESS } from "../renderer/ipcTokens";
import debounce from "lodash.debounce";

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
    const currentBlockEpoch = Math.max.apply(
      null,
      getEpochList(path.join(storePath, "block"))
    );
    const currentTxEpoch = Math.max.apply(
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
  downloadPath: string,
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel
): Promise<Epoch[]> => {
  const localEpoch = getCurrentEpoch(storePath);
  const target: Epoch[] = [];

  mixpanel?.track(`Launcher/Downloading Snapshot/metadata`);

  while (true) {
    token.throwIfCancelled();

    const checkEpochRange =
      localEpoch["BlockEpoch"] > metadata["BlockEpoch"] &&
      localEpoch["TxEpoch"] > metadata["TxEpoch"];

    if (checkEpochRange) break;

    target.push({
      BlockEpoch: metadata["BlockEpoch"],
      TxEpoch: metadata["TxEpoch"],
    });

    const checkSnapshotIsGenesis =
      metadata["PreviousBlockEpoch"] === 0 && metadata["PreviousTxEpoch"] === 0;

    if (checkSnapshotIsGenesis) break;

    const downloadTargetName = `snapshot-${metadata["PreviousBlockEpoch"]}-${metadata["PreviousTxEpoch"]}.json`;
    metadata = await downloadMetadata(
      basePath,
      downloadPath,
      downloadTargetName,
      token
    );
  }

  return target;
};

export async function aggregateSize(
  basePath: string,
  target: Epoch[],
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel
) {
  const stateSize = async () => {
    const res = await axios.head(`${basePath}/state_latest.zip`);
    return BigInt(res.headers["content-length"]);
  };
  const sizes = await Promise.all([
    stateSize(),
    ...target.map(async (v) => {
      const url = `${basePath}/snapshot-${v.BlockEpoch}-${v.TxEpoch}.zip`;
      const res = await axios.head(url);

      return BigInt(res.headers["content-length"]);
    }),
  ]);

  return sizes.reduce((a, b) => a + b);
}

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
    await cancellableDownload(
      downloadPath,
      savingPath,
      (_) => {},
      token,
      false
    );
    token.throwIfCancelled();

    const meta = await fs.promises.readFile(savingPath, "utf-8");
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
  downloadPath: string,
  onProgress: (status: IDownloadProgress) => void,
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel
): Promise<string[]> {
  token.throwIfCancelled();
  console.log("Downloading snapshot.");
  console.log(target);
  let savingPaths: string[] = [];
  const progressDict: DownloadStatus = {};

  try {
    mixpanel?.track(`Launcher/Downloading Snapshot/snapshot`);

    const downloadPromise = target.map(async (x) => {
      const downloadTargetName = `snapshot-${x.BlockEpoch}-${x.TxEpoch}.zip`;
      const savingPath = path.join(downloadPath, `${downloadTargetName}`);
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

  console.log("Snapshot download complete. Directory: ", downloadPath);
  return savingPaths;
}

export async function downloadStateSnapshot(
  basePath: string,
  downloadPath: string,
  onProgress: (status: IDownloadProgress) => void,
  token: CancellationToken,
  mixpanel?: INineChroniclesMixpanel
): Promise<string> {
  token.throwIfCancelled();
  const downloadTargetName = `state_latest.zip`;
  const savingPath = path.join(downloadPath, `${downloadTargetName}`);
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
  mixpanel?: INineChroniclesMixpanel
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

export async function removeUselessStore(
  blockchainStorePath: string
): Promise<PromiseSettledResult<void>[]> {
  const listOfUselessDb = [
    "9c-main",
    "chain",
    "stagedtx",
    "state_hashes",
    "stateref",
    "states",
    path.join("block", "blockindex"),
    path.join("tx", "txindex"),
  ];

  return Promise.allSettled(
    listOfUselessDb.map((db) => {
      console.log(`Remove ${path.join(blockchainStorePath, db)}`);
      return fs.promises.rmdir(path.join(blockchainStorePath, db), {
        recursive: true,
      });
    })
  );
}

const updateProgress = debounce(
  (win: Electron.BrowserWindow, progress: number) => {
    send(win, IPC_SNAPSHOT_PROGRESS, progress);
  },
  100
);

export async function processSnapshot(
  snapshotDownloadUrl: string,
  storePath: string,
  downloadPath: string,
  standalone: Headless,
  win: Electron.BrowserWindow,
  token: CancellationToken,
  sizeCallback: (size: bigint) => void,
  mixpanel?: INineChroniclesMixpanel
): Promise<boolean> {
  console.log(`Trying snapshot path: ${snapshotDownloadUrl}`);

  const localMetadata = standalone.getTip("rocksdb", storePath);

  const snapshotMetadata = await downloadMetadata(
    snapshotDownloadUrl,
    downloadPath,
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
      downloadPath,
      token,
      mixpanel
    );
    await aggregateSize(snapshotDownloadUrl, target, token, mixpanel).then(
      sizeCallback
    );
    send(win, IPC_PRELOAD_NEXT);
    const snapshotPaths = await downloadSnapshot(
      snapshotDownloadUrl,
      target,
      downloadPath,
      (status) => {
        win?.webContents.send("download snapshot progress", status);
        updateProgress(win, status.percent);
      },
      token,
      mixpanel
    );
    send(win, IPC_PRELOAD_NEXT);
    updateProgress.cancel();
    const stateSnapshotPath = await downloadStateSnapshot(
      snapshotDownloadUrl,
      downloadPath,
      (status) => {
        win?.webContents.send("download state snapshot progress", status);
        updateProgress(win, status.percent);
      },
      token,
      mixpanel
    );
    snapshotPaths.push(stateSnapshotPath);
    const removalResult = await removeUselessStore(storePath);
    removalResult.forEach((result) => {
      if (result.status === "fulfilled") return;
      const { reason: error } = result;
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return; // Ignore if not exist
      console.error("Error while removing useless store: ", error);
    });
    send(win, IPC_PRELOAD_NEXT);
    updateProgress.cancel();
    await extractSnapshot(
      snapshotPaths,
      storePath,
      (progress: number) => {
        win?.webContents.send("extract progress", progress);
        updateProgress(win, progress);
      },
      token,
      mixpanel
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
