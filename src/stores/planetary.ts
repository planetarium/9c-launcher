import { action, makeAutoObservable, observable } from "mobx";
import { NodeInfo, configStore, get } from "src/config";
import { Planet } from "src/interfaces/registry";
import { initializeNode } from "src/config";
import { ipcRenderer } from "electron";
import { RootStore } from "src/utils/useStore";

export default class PlanetaryStore {
  rootStore: RootStore;
  public constructor(RootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = RootStore;
  }

  @action
  public init(registry: Planet[], node: NodeInfo, accessiblePlanets: Planet[]) {
    this.registry = registry;
    this.accessiblePlanets = accessiblePlanets;
    this.setPlanet(get("Planet", "0x000000000000"));
    this.setNode(node);
  }

  @observable
  node: NodeInfo | null = null;
  @observable
  registry!: Planet[];
  @observable
  planet!: Planet;
  @observable
  accessiblePlanets!: Planet[];

  @action
  public setRegistry(registry: Planet[]) {
    this.registry = registry;
  }

  @action
  public getHost() {
    return new URL(this.node!.gqlUrl).host;
  }

  @action
  public getRpcPort() {
    return Number.parseInt(new URL(this.node!.grpcUrl).port);
  }

  @action getBridgePair() {
    if (this.planet.bridges) {
      return Object.entries(this.planet.bridges!).map(([planetId, bridge]) => {
        const name = this.getPlanetById(planetId)?.name;
        if (name !== undefined) {
          return {
            name: name,
            planetId: planetId,
            bridgeAddress: bridge.agent,
          };
        } else
          return {
            name: planetId,
            planetId: planetId,
            bridgeAddress: bridge.agent,
          };
      });
    }
    throw Error("This planet has no interplanetary bridge");
  }

  @action
  public setPlanet(planetID: string) {
    const planet = this.getPlanetById(planetID);
    if (planet === undefined) {
      console.error("No matching planet ID found, Using Default.");
      this.planet = this.accessiblePlanets[0];
    } else this.planet = planet;
    this.updateConfigToPlanet();
  }

  @action
  public async changePlanet(id: string) {
    this.setPlanet(id);
    await this.setNodeFromPlanet();
    this.updateConfigToPlanet();
  }

  @action.bound
  public getPlanetById(id: string): Planet | undefined {
    return this.registry.find((planet) => planet.id === id);
  }

  private setNode(node: NodeInfo) {
    this.node = node;
  }

  private async setNodeFromPlanet() {
    try {
      this.setNode(await initializeNode(this.planet.rpcEndpoints));
    } catch (e) {
      console.error("Failed to set node from planet:", e);
      ipcRenderer.sendSync("all-rpc-failed");
      console.log("Return to Renderer, Reconnecting.");
      await this.setNode(await initializeNode(this.planet.rpcEndpoints, true));
    }
  }

  private updateConfigToPlanet() {
    if (this.planet) {
      configStore.set("Planet", this.planet.id);
      configStore.set("GenesisBlockPath", this.planet.genesisUri);

      const playerConfig = configStore.get("PlayerConfig");
      playerConfig["MarketServiceHost"] =
        this.planet.rpcEndpoints["market.rest"];
      playerConfig["OnboardingHost"] =
        this.planet.rpcEndpoints["world-boss.rest"];
      playerConfig["ArenaServiceHost"] = this.planet.rpcEndpoints["arena.rest"];
      if ("mimir.gql" in this.planet.rpcEndpoints) {
        playerConfig["MimirServiceHost"] =
          this.planet.rpcEndpoints["mimir.gql"];
      }
      configStore.set("PlayerConfig", playerConfig);
    }
  }
}
