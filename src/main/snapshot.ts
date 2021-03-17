import { BLOCKCHAIN_STORE_PATH, LOCAL_SERVER_PORT } from "../config";
import { app, BrowserWindow } from "electron";
import fs from "fs";
import { retry } from "@lifeomic/attempt";
import { request, gql, ClientError } from "graphql-request";
import CancellationToken from "cancellationtoken";
import { IDownloadProgress } from "../interfaces/ipc";
import { cancellableDownload, cancellableExtract } from "../utils";
import path from "path";
import { DownloadSnapshotMetadataFailedError } from "./exceptions/download-snapshot-metadata-failed";
import { ValidateMetadataFailedError } from "./exceptions/validate-metadata-failed";
import { DownloadSnapshotFailedError } from "./exceptions/download-snapshot-failed";
import { ExtractSnapshotFailedError } from "./exceptions/extract-snapshot-failed";

export async function downloadMetadata(
  basePath: string,
  win: BrowserWindow,
  token: CancellationToken
): Promise<string> {
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
    return meta;
  }
  catch (error) {
    throw new DownloadSnapshotMetadataFailedError(downloadPath, savingPath);
  }
}

export async function validateMetadata(
  meta: string,
  token: CancellationToken
): Promise<boolean> {
  try {
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
        maxDelay: 5000
      }
    );

    console.log(`Validation query requested. ${validity}`);
    return validity;
  }
  catch (error) {
    throw new ValidateMetadataFailedError(meta);
  }
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
