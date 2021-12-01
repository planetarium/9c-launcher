import { observable, action, computed } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { userConfigStore, get as getConfig, NodeInfo } from "../../config";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  private _genesisBlockPath: string;

  private _language: string;

  private _appProtocolVersion: string;

  private _host: string;

  private _port: number;

  public constructor(node: NodeInfo) {
    ipcRenderer.on("game closed", (event: IpcRendererEvent) => {
      this._isGameStarted = false;
    });
    this._genesisBlockPath = getConfig("GenesisBlockPath") as string;
    this._language = getConfig("Locale") as string;
    this._appProtocolVersion = getConfig("AppProtocolVersion") as string;
    this._host = node.host;
    this._port = node.rpcPort;

    userConfigStore.onDidChange(
      "Locale",
      (value) => (this._language = value ?? "en")
    );
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
  startGame = async (privateKey: string) => {
    const awsSinkGuid: string = ipcRenderer.sendSync(
      "get-aws-sink-cloudwatch-guid"
    );
    const dataProviderUrl = getConfig("DataProviderUrl");

    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${privateKey}`,
        `--rpc-client=true`,
        `--rpc-server-host=${this._host}`,
        `--rpc-server-port=${this._port}`,
        `--genesis-block-path=${this._genesisBlockPath}`,
        `--language=${this._language}`,
        `--app-protocol-version=${this._appProtocolVersion}`,
        `--aws-sink-guid=${awsSinkGuid}`,
      ].concat(
        dataProviderUrl === undefined
          ? []
          : [`--api-server-host=${dataProviderUrl}`]
      ),
    });
    this._isGameStarted = true;
  };

  @action
  endGame = () => {
    this._isGameStarted = false;
  };
}
