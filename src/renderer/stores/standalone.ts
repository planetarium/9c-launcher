import { observable, action } from "mobx";
import {
  electronStore,
  BLOCKCHAIN_STORE_PATH,
  LOCAL_SERVER_URL,
  RPC_SERVER_PORT,
} from "../../config";

export default class StandaloneStore {
  public properties: StandaloneProperties;

  @observable
  public NoMiner: boolean;

  constructor() {
    this.properties = {
      AppProtocolVersion: electronStore.get("AppProtocolVersion") as string,
      GenesisBlockPath: electronStore.get("GenesisBlockPath") as string,
      RpcServer: true,
      RpcListenHost: "0.0.0.0",
      RpcListenPort: RPC_SERVER_PORT,
      MinimumDifficulty: electronStore.get("MinimumDifficulty") as number,
      StoreType: electronStore.get("StoreType") as string,
      StorePath: BLOCKCHAIN_STORE_PATH,
      TrustedAppProtocolVersionSigners: electronStore.get(
        "TrustedAppProtocolVersionSigners"
      ) as Array<string>,
      IceServerStrings: electronStore.get("IceServerStrings") as Array<string>,
      PeerStrings: electronStore.get("PeerStrings") as Array<string>,
      NoTrustedStateValidators: electronStore.get(
        "NoTrustedStateValidators"
      ) as boolean,
    };
    this.NoMiner = electronStore.get("NoMiner") as boolean;
  }

  @action
  initStandalone = async (privateKey: string) => {
    const properties = {
      ...this.properties,
      NoMiner: this.NoMiner,
      PrivateKeyString: privateKey,
    };

    const init = await fetch(
      `http://${LOCAL_SERVER_URL}/initialize-standalone`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(properties),
      }
    );
    await this.checkIsOk(init);

    const run = await fetch(`http://${LOCAL_SERVER_URL}/run-standalone`, {
      method: "POST",
    });
    await this.checkIsOk(run);
  };

  @action
  setMiner = (isNoMining: boolean) => {
    this.NoMiner = isNoMining;
    electronStore.set("NoMiner", isNoMining);
  };

  checkIsOk = async (response: Response) => {
    if (!response.ok) new Error(await response.text());
  };
}
