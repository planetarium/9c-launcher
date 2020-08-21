import { observable, action } from "mobx";
import { retry } from "@lifeomic/attempt";
import { electronStore, LOCAL_SERVER_URL, RPC_SERVER_PORT } from "../../config";

const retryOptions = {
  delay: 100,
  factor: 1.5,
  maxAttempts: 100,
  timeout: 30000,
  jitter: true,
  minDelay: 100,
};

export default class StandaloneStore {
  @observable
  public NoMiner: boolean;

  @observable
  public IsPreloadEnded: boolean;

  @observable
  public IsSetPrivateKeyEnded: boolean;

  private AbortRequested: boolean;

  constructor() {
    this.NoMiner = electronStore.get("NoMiner") as boolean;
    this.IsPreloadEnded = false;
    this.AbortRequested = false;
    this.IsSetPrivateKeyEnded = false;
  }

  @action
  abort = () => {
    this.AbortRequested = true;
  };

  @action
  setPrivateKeyEnded = () => {
    this.IsSetPrivateKeyEnded = true;
  };

  @action
  runStandalone = () => {
    console.log("Running standalone service...");
    return this.retryPromise("run-standalone", "");
  };

  @action
  setPrivateKey = (privateKey: string) => {
    console.log("Setting private key.");
    const body = JSON.stringify({
      PrivateKeyString: privateKey,
    });
    return this.retryPromise("set-private-key", body);
  };

  @action
  setMining = (mine: boolean) => {
    console.log("Setting mining.");
    electronStore.set("NoMiner", !mine);
    const body = JSON.stringify({
      Mine: mine,
    });
    return this.retryPromise("set-mining", body);
  };

  retryPromise = (addr: string, body: string) => {
    return retry(async (context) => {
      if (this.AbortRequested) {
        context.abort();
      }

      await fetch(`http://${LOCAL_SERVER_URL}/${addr}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
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

  checkIsOk = async (response: Response) => {
    if (response.status === 503) {
      throw new Error(await response.text());
    }
  };
}
