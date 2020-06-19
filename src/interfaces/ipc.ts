interface IDownloadOptions {
    properties: {
        saveAs?: boolean,
        directory?: string,
        filename?: string,
        onProgress?: (status: IDownloadProgress) => void,
    }
}

interface IDownloadProgress {
    percent: number,
    transferredBytes: number,
    totalBytes: number
}