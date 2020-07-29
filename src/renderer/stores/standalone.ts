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

  @observable
  public IsPreloadEnded: boolean;

  constructor() {
    this.NoMiner = electronStore.get("NoMiner") as boolean;
    this.IsPreloadEnded = false;
  }

  @action
  runStandalone = () => {
    console.log("Running standalone service...");
    return new Promise((resolve, reject) => {
      // TODO: thundering herd
      const delay = 1000;
      const maxRetry = 30;
      let retry = 0;
      const tid = setInterval(() => {
        fetch(`http://${LOCAL_SERVER_URL}/run-standalone`, {
          method: "POST",
        })
          .then((resp) => this.checkIsOk(resp))
          .then(() => {
            console.log(`Successfully fetched standalone in ${retry} retries.`);
            clearInterval(tid);
            resolve();
          })
          .catch((error) => {
            if (retry > maxRetry) {
              console.error(
                `Failed to fetch standalone in ${maxRetry} retries.`
              );
              clearInterval(tid);
              reject(error);
            } else {
              retry++;
              console.log(
                `Failed to fetch standalone. Retrying after ${delay}...`
              );
            }
          });
      }, delay);
    });
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
