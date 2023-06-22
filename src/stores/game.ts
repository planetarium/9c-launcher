import { observable, action, computed, makeObservable } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { userConfigStore, get as getConfig, genesisUrl } from "src/config";

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
    this._genesisBlockPath = genesisUrl;
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
    const marketServiceUrl = getConfig("MarketServiceUrl");

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
        `--on-boarding-host=${portalUrl}`,
        `--sentry-sample-rate=${unitySentrySampleRate}`,
        `--market-service-host=${marketServiceUrl}`,
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
