import { ipcRenderer, IpcRendererEvent } from "electron";
import { action, computed, makeObservable, observable } from "mobx";
import { get as getConfig, userConfigStore } from "src/config";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  private _genesisBlockPath: string;

  private _language: string;

  private _appProtocolVersion: string;

  private _host: string | undefined;

  private _port: number | undefined;

  public constructor() {
    makeObservable(this);

    ipcRenderer.on("game closed", (event: IpcRendererEvent) => {
      this._isGameStarted = false;
    });
    this._genesisBlockPath = getConfig("GenesisBlockPath") as string;
    this._language = getConfig("Locale", "en") as string;
    this._appProtocolVersion = getConfig("AppProtocolVersion") as string;
    ipcRenderer.invoke("get-node-info").then((node) => {
      this._host = node.host;
      this._port = node.rpcPort;
    });
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
  startGame = (privateKey: string) => {
    const awsSinkGuid: string = ipcRenderer.sendSync(
      "get-aws-sink-cloudwatch-guid"
    );
    const dataProviderUrl = getConfig("DataProviderUrl");
    const portalUrl = getConfig("OnboardingPortalUrl");
    const unitySentrySampleRate = getConfig("UnitySentrySampleRate", 0);

    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${privateKey}`,
        "--rpc-client=true",
        `--rpc-server-host=${this._host}`,
        `--rpc-server-port=${this._port}`,
        `--genesis-block-path=${this._genesisBlockPath}`,
        `--language=${this._language}`,
        `--app-protocol-version=${this._appProtocolVersion}`,
        `--aws-sink-guid=${awsSinkGuid}`,
        `--on-boarding-host=${portalUrl}`,
        `--sentry-sample-rate=${unitySentrySampleRate}`,
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
