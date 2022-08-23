import { observable, action } from "mobx";
import { get } from "src/config";

export default class StandaloneStore {
  @observable
  public NoMiner: boolean;

  @observable
  public Ready: boolean;

  @observable
  public IsSetPrivateKeyEnded: boolean;

  constructor() {
    this.NoMiner = get("NoMiner") as boolean;
    this.Ready = false;
    this.IsSetPrivateKeyEnded = false;
  }

  @action
  setReady = (value: boolean) => {
    this.Ready = value;
  };

  @action
  setPrivateKeyEnded = (value: boolean) => {
    this.IsSetPrivateKeyEnded = value;
  };
}
