export class DownloadSnapshotMetadataFailedError extends Error {
    constructor(basePath: string) {
      super(`Download snapshot metadata failed.\nbasePath: ${basePath}`);
    }
  }
  