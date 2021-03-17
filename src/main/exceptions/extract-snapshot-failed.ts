export class ExtractSnapshotFailedError extends Error {
  constructor(snapshotPath: string) {
    super(`Extract snapshot failed.\nsnapshotPath: ${snapshotPath}`);
  }
}
