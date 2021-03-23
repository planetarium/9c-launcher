import { observable, action, computed } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { supportedLocales } from "../i18n";
import { RPC_SERVER_HOST, RPC_SERVER_PORT, electronStore } from "../../config";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  private _genesisBlockPath: string;

  private _language: string;

  private _appProtocolVersion: string;

  public constructor() {
    ipcRenderer.on("game closed", (event: IpcRendererEvent) => {
      this._isGameStarted = false;
    });
    this._genesisBlockPath = electronStore.get("GenesisBlockPath") as string;
    this._language = electronStore.get("Locale") as string;
    this._appProtocolVersion = electronStore.get(
      "AppProtocolVersion"
    ) as string;

    if (!(this._language in supportedLocales)) {
      this._language = "en";
    }
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
    const awsSinkGuid: string = ipcRenderer.sendSync(
      "get-aws-sink-cloudwatch-guid"
    );

    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${privateKey}`,
        `--rpc-client=true`,
        `--rpc-server-host=${RPC_SERVER_HOST}`,
        `--rpc-server-port=${RPC_SERVER_PORT}`,
        `--genesis-block-path=${this._genesisBlockPath}`,
        `--language=${this._language}`,
        `--app-protocol-version=${this._appProtocolVersion}`,
        `--aws-sink-guid=${awsSinkGuid}`,
      ],
    });
    this._isGameStarted = true;
  };

  @action
  endGame = () => {
    this._isGameStarted = false;
  };
}
