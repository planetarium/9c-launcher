import { observable, action, computed } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";

export default class DownloadStore {
  @observable
  private _extractState: boolean = false;

  @observable
  private _downloadState: boolean = false;

  @observable
  private _progress: number = 0;

  public constructor() {
    ipcRenderer.on("extract progress", (event, progress) => {
      this._extractState = true;
      this._progress = progress * 100;
    });

    ipcRenderer.on("extract complete", (event) => {
      this._extractState = false;
    });

    ipcRenderer.on(
      "download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        this._downloadState = true;
        this._progress = progress.percent * 100;
      }
    );

    ipcRenderer.on(
      "download complete",
      (event: IpcRendererEvent, path: string) => {
        this._downloadState = false;
      }
    );
  }
}
