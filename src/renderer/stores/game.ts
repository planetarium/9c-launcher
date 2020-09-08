import { observable, action, computed } from "mobx";
import { ipcRenderer } from "electron";
import {
  RPC_LOOPBACK_HOST,
  RPC_SERVER_PORT,
  electronStore,
} from "../../config";

export default class GameStore {
  @observable
  private _isGameStarted = false;

  private _genesisBlockPath: string;

  public constructor() {
    ipcRenderer.on("game closed", () => {
      this._isGameStarted = false;
    });
    this._genesisBlockPath = electronStore.get("GenesisBlockPath") as string;
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
      ],
    });
    this._isGameStarted = true;
  };

  @action
  endGame = () => {
    this._isGameStarted = false;
  };
}
