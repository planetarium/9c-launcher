import { observable, action, computed } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";
import {
  RPC_LOOPBACK_HOST,
  RPC_SERVER_PORT,
  electronStore,
} from "../../config";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  private _genesisBlockPath: string;

  private _language: string;

  public constructor() {
    ipcRenderer.on("game closed", (event: IpcRendererEvent) => {
      this._isGameStarted = false;
    });
    this._genesisBlockPath = electronStore.get("GenesisBlockPath") as string;
    this._language = electronStore.get("Locale") as string;
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
  startGame = (privateKey: string) => {
    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${privateKey}`,
        `--rpc-client=true`,
        `--rpc-server-host=${RPC_LOOPBACK_HOST}`,
        `--rpc-server-port=${RPC_SERVER_PORT}`,
        `--genesis-block-path=${this._genesisBlockPath}`,
        `--language=${this._language}`,
      ],
    });
    this._isGameStarted = true;
  };

  @action
  endGame = () => {
    this._isGameStarted = false;
  };
}
