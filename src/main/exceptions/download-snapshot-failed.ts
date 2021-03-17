export class DownloadSnapshotFailedError extends Error {
  constructor(basePath: string) {
    super(`Download snapshot failed.\nbasePath: ${basePath}`);
  }
}
