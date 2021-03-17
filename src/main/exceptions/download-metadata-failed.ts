export class DownloadMetadataFailedError extends Error {
    constructor(basePath: string) {
      super(`Download metadata failed.\nbasePath: ${basePath}`);
    }
  }
  