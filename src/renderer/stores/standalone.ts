import { observable, action } from "mobx";
import { retry } from "@lifeomic/attempt";
import { electronStore, LOCAL_SERVER_URL, RPC_SERVER_PORT } from "../../config";

const retryOptions = {
  delay: 100,
  factor: 1.5,
  maxAttempts: 10,
  timeout: 1000,
  jitter: true,
  minDelay: 100,
};

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
    return retry(async (context) => {
      await fetch(`http://${LOCAL_SERVER_URL}/run-standalone`, {
        method: "POST",
      })
        .then((resp) => this.checkIsOk(resp))
        .then(() => {
          console.log(
            `Successfully fetched standalone in ${context.attemptNum} retries.`
          );
        })
        .catch((error) => {
          console.log(
            `Failed to fetch standalone. Retrying... ${context.attemptNum}/${
              context.attemptsRemaining + context.attemptNum
            }`
          );
          throw error;
        });
    }, retryOptions);
  };

  @action
  setMining = (mine: boolean, privateKey: string) => {
    electronStore.set("NoMiner", !mine);
    return retry(async (context) => {
      await fetch(`http://${LOCAL_SERVER_URL}/set-private-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PrivateKeyString: privateKey,
        }),
      })
        .then((resp) => this.checkIsOk(resp))
        .then((_) => {
          console.log(
            `Successfully fetched standalone in ${context.attemptNum} retries.`
          );
          return fetch(`http://${LOCAL_SERVER_URL}/set-mining`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Mine: mine,
            }),
          });
        })
        .then((resp) => this.checkIsOk(resp))
        .catch((error) => {
          console.log(
            `Failed to fetch standalone. Retrying... ${context.attemptNum}/${
              context.attemptsRemaining + context.attemptNum
            }`
          );
          throw error;
        });
    }, retryOptions);
  };

  checkIsOk = async (response: Response) => {
    if (!response.ok) throw new Error(await response.text());
  };
}
