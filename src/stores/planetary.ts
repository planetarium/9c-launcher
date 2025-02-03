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
      ipcRenderer.sendSync("all-rpc-failed");
      console.log("Return to Renderer, Reconnecting.");
      await this.setNode(await initializeNode(this.planet.rpcEndpoints, true));
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
      configStore.set(
        "OnboardingPortalUrl",
        this.planet.rpcEndpoints["world-boss.rest"],
      );
      if (this.planet.guildIconBucket) {
        configStore.set("GuildIconBucket", this.planet.guildIconBucket);
      } else {
        configStore.delete("GuildIconBucket");
      }
      if (this.planet.rpcEndpoints["guild.rest"]) {
        configStore.set(
          "GuildServiceUrl",
          this.planet.rpcEndpoints["guild.rest"][0],
        );
      } else {
        configStore.delete("GuildServiceUrl");
      }
      configStore.set(
        "ArenaServiceUrl",
        this.planet.rpcEndpoints["arena.rest"],
      );
    }
  }
}
