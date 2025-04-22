import { observable, action, computed, makeAutoObservable } from "mobx";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { userConfigStore, get as getConfig } from "src/config";
import { RootStore } from "src/utils/useStore";
import { PlayerArguments } from "../interfaces/config";

export default class GameStore {
  @observable
  private _isGameStarted: boolean = false;

  private _language: string;
  public _country: string = "KR";
  public _whitelist: boolean = false;
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
  public setGeoBlock(country: string, whitelist: boolean) {
    (this._country = country), (this._whitelist = whitelist);
  }

  @computed
  get isGameBlocked(): boolean {
    return ["KR"].includes(this._country) && !this._whitelist;
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
    const genesisBlockPath = getConfig("GenesisBlockPath");
    const appProtocolVersion = getConfig("AppProtocolVersion");
    const planetRegistryUrl = getConfig("PlanetRegistryUrl");
    const playerArguments = getConfig("PlayerConfig");

    const initializePlayerArgs = (): string[] => {
      const args: string[] = [
        `--private-key=${privateKey}`,
        `--rpc-client`,
        `--rpc-server-host=${host}`,
        `--rpc-server-port=${port}`,
        `--selected-planet-id=${planetId}`,
        `--genesis-block-path=${genesisBlockPath}`,
        `--language=${this._language}`,
        `--app-protocol-version=${appProtocolVersion}`,
        `--planet-registry-url=${planetRegistryUrl}`,
      ];

      const appendIfDefined = (value: string | undefined, label: string) => {
        if (value !== undefined) {
          args.push(`--${label}=${value}`);
        }
      };

      const pascalToKebabCase = (input: string): string => {
        return input
          .replace(/([a-z])([A-Z])/g, "$1-$2") // Add hyphen between lowercase and uppercase
          .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2") // Handle consecutive uppercase letters
          .toLowerCase(); // Convert entire string to lowercase
      };

      for (const [key, value] of Object.entries(playerArguments)) {
        const pascalKey = pascalToKebabCase(key);
        if (typeof value === "boolean") {
          if (value) {
            args.push(`--${pascalKey}`);
          }
        } else {
          appendIfDefined(value, pascalKey);
        }
      }

      return args;
    };

    const playerArgs = initializePlayerArgs();

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
