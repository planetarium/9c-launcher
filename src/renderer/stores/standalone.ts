import { observable, action } from "mobx";
import {
  electronStore,
  BLOCKCHAIN_STORE_PATH,
  LOCAL_SERVER_URL,
  RPC_SERVER_PORT,
} from "../../config";

export default class StandaloneStore {
  @observable
  public NoMiner: boolean;

  constructor() {
    this.NoMiner = electronStore.get("NoMiner") as boolean;
  }

  @action
  runStandalone = () => {
    return fetch(`http://${LOCAL_SERVER_URL}/run-standalone`, {
      method: "POST",
    }).then((resp) => this.checkIsOk(resp));
  };

  @action
  setMining = (mine: boolean, privateKey: string) => {
    electronStore.set("NoMiner", !mine);
    return fetch(`http://${LOCAL_SERVER_URL}/set-private-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        PrivateKeyString: privateKey,
      }),
    })
      .then((resp) => this.checkIsOk(resp))
      .then((_) =>
        fetch(`http://${LOCAL_SERVER_URL}/set-mining`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Mine: mine,
          }),
        })
      )
      .then((resp) => this.checkIsOk(resp));
  };

  checkIsOk = async (response: Response) => {
    if (!response.ok) throw new Error(await response.text());
  };
}
