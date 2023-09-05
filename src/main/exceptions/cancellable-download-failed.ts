export class CancellableDownloadFailedError extends Error {
  constructor(url: string, downloadPath: string) {
    super(
      `Cancellable download failed.\nurl: ${url}\ndownloadPath: ${downloadPath}`,
    );
  }
}
