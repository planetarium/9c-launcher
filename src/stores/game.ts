import { observable, action, computed, makeAutoObservable } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { userConfigStore, get as getConfig } from "src/config";
import { RootStore } from "src/utils/useStore";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  private _language: string;
  rootStore: RootStore;

  public constructor(RootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = RootStore;

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
  startGame = (
    privateKey: string,
    host: string,
    port: number,
    planetId: string,
  ) => {
    const awsSinkGuid: string = ipcRenderer.sendSync(
      "get-aws-sink-cloudwatch-guid",
    );
    const dataProviderUrl = getConfig("DataProviderUrl");
    const portalUrl = getConfig("OnboardingPortalUrl");
    const unitySentrySampleRate = getConfig("UnitySentrySampleRate", 0);
    const marketServiceUrl = getConfig("MarketServiceUrl");
    const patrolRewardServiceUrl = getConfig("PatrolRewardServiceUrl");
    const seasonPassServiceUrl = getConfig("SeasonPassServiceUrl");
    const meadPledgePortalUrl = getConfig("MeadPledgePortalUrl");
    const genesisBlockPath = getConfig("GenesisBlockPath");
    const appProtocolVersion = getConfig("AppProtocolVersion");
    const IAPServiceHostUrl = getConfig("IAPServiceHostUrl");
    const appleMarketUrl = getConfig("AppleMarketUrl");
    const googleMarketUrl = getConfig("GoogleMarketUrl");

    const playerArgs = [
      `--private-key=${privateKey}`,
      `--rpc-client=true`,
      `--rpc-server-host=${host}`,
      `--rpc-server-port=${port}`,
      `--selected-planet-id=${planetId}`,
      `--genesis-block-path=${genesisBlockPath}`,
      `--language=${this._language}`,
      `--app-protocol-version=${appProtocolVersion}`,
      `--aws-sink-guid=${awsSinkGuid}`,
      `--on-boarding-host=${portalUrl}`,
      `--sentry-sample-rate=${unitySentrySampleRate}`,
      `--market-service-host=${marketServiceUrl}`,
      `--patrol-reward-service-host=${patrolRewardServiceUrl}`,
      `--season-pass-service-host=${seasonPassServiceUrl}`,
      `--mead-pledge-portal-url=${meadPledgePortalUrl}`,
      `--iap-service-host=${IAPServiceHostUrl}`,
      `--apple-market-url=${appleMarketUrl}`,
      `--google-market-url=${googleMarketUrl}`,
    ];

    const appendIfDefined = (value: string | undefined, label: string) => {
      if (value !== undefined) {
        playerArgs.push(`--${label}=${value}`);
      }
    };

    appendIfDefined(dataProviderUrl, "api-server-host");

    ipcRenderer.send("launch game", {
      args: playerArgs,
    });
    this._isGameStarted = true;
  };

  @action
  endGame = () => {
    this._isGameStarted = false;
  };
}
