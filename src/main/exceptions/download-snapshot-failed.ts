export class DownloadSnapshotFailedError extends Error {
  constructor(downloadPath: string, savingPath: string) {
    super(
      `Download snapshot failed.\ndownloadPath: ${downloadPath}\nsavingPath: ${savingPath}`,
    );
  }
}
