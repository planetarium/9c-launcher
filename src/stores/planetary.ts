import { action, makeObservable, observable } from "mobx";
import { NodeInfo, configStore, get, registry } from "src/config";
import { Planet } from "src/interfaces/registry";
import { initializeNode } from "src/config";
import { ipcRenderer } from "electron";

export default class PlanetaryStore {
  @observable
  public node!: NodeInfo;

  @observable
  public host: string = new URL(this.node.gqlUrl).host;

  @observable
  public rpcPort: number = Number.parseInt(new URL(this.node.grpcUrl).port);

  @observable
  public registry: Planet[] = registry;

  @observable
  public planet!: Planet;

  @action
  public setRegistry(registry: Planet[]) {
    this.registry = registry;
    this.setPlanet(get("Planet", "0x000000000000"));
  }

  @action
  public setPlanet(planetID: string) {
    const planet = this.getPlanetById(planetID);
    if (planet === undefined) {
      throw Error("No matching planet ID found");
    }
    this.planet = planet;
    this.setNodeFromPlanet(planet);
    this.updateConfigToRegistry();
  }

  public constructor() {
    makeObservable(this);
    this.setPlanet(get("Planet", "0x000000000000"));
  }

  @action
  public getPlanetById = (id: string): Planet | undefined => {
    return this.registry
      ? this.registry.find((planet) => planet.id === id)
      : undefined;
  };

  private async setNodeFromPlanet(planet: Planet) {
    try {
      this.node = await initializeNode(planet.rpcEndpoints);
    } catch (e) {
      console.error(e);
      ipcRenderer.invoke("all-rpc-failed").then((v: boolean) => {
        this.setNodeFromPlanet(this.planet);
      });
    }
  }

  private updateConfigToRegistry = () => {
    const planet = this.getPlanetById(configStore.get("Planet"));
    if (planet) {
      configStore.set("GenesisBlockPath", planet.genesisUri);
      configStore.set("DataProviderUrl", planet.rpcEndpoints["dp.gql"]);
    }
  };
}
