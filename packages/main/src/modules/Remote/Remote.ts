import {z} from 'zod';
import {PLANET_REGISTRY} from '/@/constants';
import {Planet, PlanetArraySchema} from '/@/types/registry';

export default class Remote {
  private _planetRegistry: Planet[] | null = null;
  private _isChangingPlanet: boolean = false;

  constructor() {
    this.init();
    this.registerEvents();
    // isOnline Tracker
  }

  public async init(): Promise<void> {
    this.fetchPlanetary();
  }

  public async fetchPlanetary(): Promise<void> {
    try {
      const res = await fetch(PLANET_REGISTRY);
      if (!res.ok) {
        throw new Error(`[REMOTE]: Response status: ${res.status}`);
      }
      const jsonData = await res.json();

      this._planetRegistry = PlanetArraySchema.parse(jsonData);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  public changePlanet(planetId: string) {
    // changePlanetID
    // setPlanetServiceEndpoint
  }

  private setPlanetServiceEndpoint(planetId: string) {
    // check current Planet
    // get service endpoint from this._planetRegistry -> keyv
  }

  private registerEvents = (): void => {};
}
