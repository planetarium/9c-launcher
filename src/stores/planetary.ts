import { action, makeObservable, observable } from "mobx";
import { NodeInfo, configStore, get, registry } from "src/config";
import { Planet } from "src/interfaces/registry";
import { initializeNode } from "src/config";
import { ipcRenderer } from "electron";

export default class PlanetaryStore {
  public constructor() {
    makeObservable(this);
  }

  @observable
  public node: NodeInfo | null = null;

  @observable
  public registry: Planet[] = registry;

  @observable
  public planet: Planet | null = null;

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

  private async setNodeFromPlanet(planet: Planet) {
    try {
      this.node = await initializeNode(planet.rpcEndpoints);
    } catch (e) {
      console.error(e);
      ipcRenderer.send("all-rpc-failed");
    }
  }

  @action
  public getPlanetById = (id: string): Planet | undefined => {
    return this.registry
      ? this.registry.find((planet) => planet.id === id)
      : undefined;
  };

  private updateConfigToRegistry = () => {
    const planet = this.getPlanetById(configStore.get("Planet"));
    if (planet) {
      configStore.set("GenesisBlockPath", planet.genesisUri);
      configStore.set("DataProviderUrl", planet.rpcEndpoints["dp.gql"]);
    }
  };
}
