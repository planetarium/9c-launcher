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
  public init(registry: Planet[], node: NodeInfo) {
    this.registry = registry;
    this.setPlanet(get("Planet", "0x000000000000"));
    this.setNode(node);
  }

  @observable
  node: NodeInfo | null = null;
  @observable
  registry!: Planet[];
  @observable
  planet!: Planet;

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

  @action
  public setPlanet(planetID: string) {
    const planet = this.getPlanetById(planetID);
    if (planet === undefined) {
      console.error("No matching planet ID found, Using Default.");
      this.planet = this.registry[0];
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
      ipcRenderer.invoke("all-rpc-failed").then(async () => {
        await this.setNodeFromPlanet();
      });
    }
  }

  private updateConfigToPlanet() {
    if (this.planet) {
      configStore.set("Planet", this.planet.id);
      configStore.set("GenesisBlockPath", this.planet.genesisUri);
      configStore.set("DataProviderUrl", this.planet.rpcEndpoints["dp.gql"]);
      configStore.set(
        "MarketServiceUrl",
        this.planet.rpcEndpoints["market.rest"],
      );
      configStore.set(
        "PatrolRewardServiceUrl",
        this.planet.rpcEndpoints["patrol-reward.gql"],
      );
    }
  }
}
