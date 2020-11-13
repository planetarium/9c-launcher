import { DownloadItem } from "electron";

export interface IDownloadOptions {
  properties: {
    saveAs?: boolean;
    directory?: string;
    filename?: string;
    onProgress?: (status: IDownloadProgress) => void;
    onStarted?: (item: DownloadItem) => void;
    onCancel?: (item: DownloadItem) => void;
  };
}

export interface IDownloadProgress {
  percent: number;
  transferredBytes: number;
  totalBytes: number;
}

export interface IGameStartOptions {
  args: string[];
}
