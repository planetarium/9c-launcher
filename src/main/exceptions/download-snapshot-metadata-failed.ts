export class DownloadSnapshotMetadataFailedError extends Error {
  constructor(downloadPath: string, savingPath: string) {
    super(
      `Download snapshot metadata failed.\ndownloadPath: ${downloadPath}\nsavingPath: ${savingPath}`,
    );
  }
}
