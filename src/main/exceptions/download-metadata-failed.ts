export class DownloadMetadataFailedError extends Error {
    constructor(basePath: string) {
      super(`DownloadMetadata failed.\nbasePath: ${basePath}`);
    }
  }
  