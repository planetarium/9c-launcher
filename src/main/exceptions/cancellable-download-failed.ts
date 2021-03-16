export class CancellableDownloadFailedError extends Error {
    constructor(url: string, downloadPath: string) {
      super(`CancellableDownload failed.\nurl: ${url}\ndownloadPath: ${downloadPath}`);
    }
  }
  