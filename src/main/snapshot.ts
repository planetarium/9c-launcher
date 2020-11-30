import {
  electronStore,
  BLOCKCHAIN_STORE_PATH,
  LOCAL_SERVER_PORT,
} from "../config";
import { app, BrowserWindow } from "electron";
import fs from "fs";
import { retry } from "@lifeomic/attempt";
import { request, gql, ClientError } from "graphql-request";
import CancellationToken from "cancellationtoken";
import { IDownloadOptions, IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract } from "../utils";

export async function downloadMetadata(
  win: BrowserWindow,
  token: CancellationToken
): Promise<string> {
  token.throwIfCancelled();
  console.log("Downloading metadata.");
  const options: IDownloadOptions = {
    properties: { onProgress: () => {} },
  };
  options.properties.directory = app.getPath("userData");
  options.properties.filename = "meta.json";
  let dl = await cancellableDownload(
    win,
    (electronStore.get("SNAPSHOT_DOWNLOAD_PATH") as string) + ".json",
    options,
    token
  );
  token.throwIfCancelled();

  let meta = await fs.promises.readFile(dl.getSavePath(), "utf-8");
  console.log("Metadata download complete: ", meta);
  return meta;
}

export async function validateMetadata(
  meta: string,
  token: CancellationToken
): Promise<boolean> {
  token.throwIfCancelled();
  let parsedmeta = meta.replace(/"/g, '\\"');
  console.log(`Validating metadata. ${parsedmeta}`);
  let query = gql`
{
  validation {
    metadata(raw: "${parsedmeta}")
  }
}`;
  let validity = await retry(
    async (context) => {
      try {
        if (token.isCancelled) {
          context.abort();
          token.throwIfCancelled();
        }

        let data = await request(
          `http://localhost:${LOCAL_SERVER_PORT}/graphql`,
          query
        );

        return data.validation.metadata;
      } catch (error) {
        if (error instanceof ClientError) {
          let status: number = error.response.status;
          if (status == 404) {
            // GraphQL server is not online
            console.error(
              `GraphQLError occurred validating metadata. Retrying... : ${error}`
            );
          } else if (status == 200) {
            // Exception occurred during validation at standalone
            console.error(
              `Error occurred during validating metadata. Snapshot required. : ${JSON.stringify(
                error.response.errors?.map((v) => v.message)
              )}`
            );
            return true;
          }
        } else {
          console.error(
            `Unhandled error occurred during request... : ${error}`
          );
        }

        throw error;
      }
    },
    {
      delay: 100,
      factor: 1.5,
      maxAttempts: 15,
      jitter: true,
      minDelay: 100,
      maxDelay: 5000,
    }
  );

  console.log(`Validation query requested. ${validity}`);
  return validity;
}

export async function downloadSnapshot(
  win: BrowserWindow,
  onProgress: (status: IDownloadProgress) => void,
  token: CancellationToken
): Promise<string> {
  token.throwIfCancelled();
  console.log("Downloading snapshot.");
  const options: IDownloadOptions = {
    properties: {},
  };
  options.properties.onProgress = (status: IDownloadProgress) =>
    onProgress(status);
  options.properties.directory = app.getPath("userData");
  options.properties.filename = "snapshot.zip";
  const dl = await cancellableDownload(
    win,
    (electronStore.get("SNAPSHOT_DOWNLOAD_PATH") as string) + ".zip",
    options,
    token
  );
  token.throwIfCancelled();
  let dir = dl.getSavePath();
  console.log("Snapshot download complete. Directory: ", dir);
  return dir;
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
