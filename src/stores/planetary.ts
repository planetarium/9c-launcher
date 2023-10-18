import { action, makeObservable, observable } from "mobx";
import { NodeInfo, configStore, get } from "src/config";
import { Planet } from "src/interfaces/registry";
import { initializeNode } from "src/config";
import { ipcRenderer } from "electron";

export default class PlanetaryStore {
  @observable
  public node!: NodeInfo;

  @observable
  public host: string = "";

  @observable
  public rpcPort: number = 31238;

  @observable
  public registry: Planet[] = [];

  @observable
  public planet!: Planet;

  @action
  public async setPlanet(planetID: string) {
    const planet = this.getPlanetById(planetID);
    if (planet === undefined) {
      throw Error("No matching planet ID found");
    }
    this.planet = planet;
    this.updateConfigToRegistry();
    await this.setNodeFromPlanet(planet);
  }

  public constructor() {
    fetch(configStore.get("PlanetRegistryUrl"), {}).then(async (data) => {
      this.registry = await data.json();
      await this.setPlanet(get("Planet", "0x000000000000"));
    });
    makeObservable(this);
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
      this.host = new URL(this.node.gqlUrl).host;
      this.rpcPort = Number.parseInt(new URL(this.node.grpcUrl).port);
    } catch (e) {
      console.error(e);
      ipcRenderer.invoke("all-rpc-failed").then((v: boolean) => {
        this.setNodeFromPlanet(this.planet);
      });
    }
  }

  private updateConfigToRegistry = () => {
    if (this.planet) {
      configStore.set("GenesisBlockPath", this.planet.genesisUri);
      configStore.set("DataProviderUrl", this.planet.rpcEndpoints["dp.gql"]);
    }
  };
}
