import { observable, action, computed } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  public constructor() {
    ipcRenderer.on("game closed", (event: IpcRendererEvent) => {
      this._isGameStarted = false;
    });
  }

  @computed
  get isGameStarted(): boolean {
    return this._isGameStarted;
  }

  @action
  public setGameStarted(set: boolean) {
    this._isGameStarted = set;
  }

  @action
  startGame = (
    privateKey: string,
    client: boolean,
    roopbackHost: string,
    serverPort: number
  ) => {
    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${privateKey}`,
        `--rpc-client=${client}`,
        `--rpc-server-host=${roopbackHost}`,
        `--rpc-server-port=${serverPort}`,
      ],
    });
    this._isGameStarted = true;
  };

  @action
  endGame = () => {
    this._isGameStarted = false;
  };
}
