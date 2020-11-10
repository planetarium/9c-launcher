import {
  electronStore,
  BLOCKCHAIN_STORE_PATH,
  LOCAL_SERVER_PORT,
} from "../config";
import { app, BrowserWindow } from "electron";
import fs from "fs";
import { download } from "electron-dl";
import extractZip from "extract-zip";
import { retry } from "@lifeomic/attempt";
import { request, gql } from "graphql-request";

export async function downloadMetadata(win: BrowserWindow): Promise<string> {
  console.log("Downloading metadata.");
  const options: IDownloadOptions = {
    properties: { onProgress: () => {} },
  };
  options.properties.directory = app.getPath("userData");
  options.properties.filename = "meta.json";
  let dl = await download(
    win,
    (electronStore.get("SNAPSHOT_DOWNLOAD_PATH") as string) + ".json",
    options.properties
  );

  let meta = await fs.promises.readFile(dl.getSavePath(), "utf-8");
  console.log("Metadata download complete: ", meta);
  return meta;
}

export async function validateMetadata(meta: string): Promise<boolean> {
  let parsedmeta = meta.replace(/"/g, '\\"');
  console.log(`Validating metadata. ${parsedmeta}`);
  let query = gql`
{
  validation {
    metadata(raw: "${parsedmeta}")
  }
}`;
  let data = await retry(
    async (context) => {
      try {
        let _data = await request(
          `http://localhost:${LOCAL_SERVER_PORT}/graphql`,
          query
        );

        return _data;
      } catch (error) {
        console.log(
          `Unhandled exception occurred validating metadata. Abort: ${error}`
        );
        throw error;
      }
    },
    {
      delay: 100,
      factor: 1.5,
      maxAttempts: 100,
      timeout: 30000,
      jitter: true,
      minDelay: 100,
    }
  );

  let validity: boolean = data.validation.metadata;
  console.log(`Validation query requested. ${validity}`);
  return validity;
}

export async function downloadSnapshot(
  win: BrowserWindow,
  onProgress: (status: IDownloadProgress) => void
): Promise<string> {
  console.log("Downloading snapshot.");
  const options: IDownloadOptions = {
    properties: {},
  };
  options.properties.onProgress = (status: IDownloadProgress) =>
    onProgress(status);
  options.properties.directory = app.getPath("userData");
  options.properties.filename = "snapshot.zip";
  const dl = await download(
    win,
    (electronStore.get("SNAPSHOT_DOWNLOAD_PATH") as string) + ".zip",
    options.properties
  );
  let dir = dl.getSavePath();
  console.log("Snapshot download complete. Directory: ", dir);
  return dir;
}

export async function extractSnapshot(
  snapshotPath: string,
  onProgress: (progress: number) => void
): Promise<void> {
  console.log(`Extracting snapshot.
extractPath: [ ${BLOCKCHAIN_STORE_PATH} ],
extractTarget: [ ${snapshotPath} ]`);
  await extractZip(snapshotPath, {
    dir: BLOCKCHAIN_STORE_PATH,
    onEntry: (_, zipfile) => {
      const progress = zipfile.entriesRead / zipfile.entryCount;
      onProgress(progress);
    },
  });
  fs.unlinkSync(snapshotPath);
  console.log("Snapshot extract complete.");
}
