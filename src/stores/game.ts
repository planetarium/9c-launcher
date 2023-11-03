import { observable, action, computed, makeObservable } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { userConfigStore, get as getConfig } from "src/config";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  private _language: string;

  public constructor() {
    makeObservable(this);

    ipcRenderer.on("game closed", (event: IpcRendererEvent) => {
      this._isGameStarted = false;
    });
    this._language = getConfig("Locale", "en") as string;
    userConfigStore.onDidChange(
      "Locale",
      (value) => (this._language = value ?? "en"),
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
  startGame = (privateKey: string, host: string, port: number) => {
    const awsSinkGuid: string = ipcRenderer.sendSync(
      "get-aws-sink-cloudwatch-guid",
    );
    const dataProviderUrl = getConfig("DataProviderUrl");
    const portalUrl = getConfig("OnboardingPortalUrl");
    const unitySentrySampleRate = getConfig("UnitySentrySampleRate", 0);
    const marketServiceUrl = getConfig("MarketServiceUrl");
    const patrolRewardServiceUrl = getConfig("PatrolRewardServiceUrl");
    const meadPledgePortalUrl = getConfig("MeadPledgePortalUrl");
    const genesisBlockPath = getConfig("GenesisBlockPath");
    const appProtocolVersion = getConfig("AppProtocolVersion");

    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${privateKey}`,
        `--rpc-client=true`,
        `--rpc-server-host=${host}`,
        `--rpc-server-port=${port}`,
        `--genesis-block-path=${genesisBlockPath}`,
        `--language=${this._language}`,
        `--app-protocol-version=${appProtocolVersion}`,
        `--aws-sink-guid=${awsSinkGuid}`,
        `--on-boarding-host=${portalUrl}`,
        `--sentry-sample-rate=${unitySentrySampleRate}`,
        `--market-service-host=${marketServiceUrl}`,
        `--patrol-reward-service-host=${patrolRewardServiceUrl}`,
        `--mead-pledge-portal-url=${meadPledgePortalUrl}`,
      ].concat(
        dataProviderUrl === undefined
          ? []
          : [`--api-server-host=${dataProviderUrl}`],
      ),
    });
    this._isGameStarted = true;
  };

  @action
  endGame = () => {
    this._isGameStarted = false;
  };
}
