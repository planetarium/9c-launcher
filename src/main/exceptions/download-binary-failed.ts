export class DownloadBinaryFailedError extends Error {
  constructor(downloadUrl: string) {
    super(`Download binary failed.\ndownloadUrl: ${downloadUrl}`);
  }
}
