import { action, makeObservable, observable } from "mobx";
import { NodeInfo } from "src/config";
import { Planet } from "src/interfaces/registry";

export default class PlanetaryStore {
  public constructor() {
    makeObservable(this);
  }

  @observable
  public node: NodeInfo | null = null;

  @action
  public setNode(node: NodeInfo) {
    this.node = node;
  }
}
