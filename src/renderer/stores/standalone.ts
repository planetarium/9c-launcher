import { observable, action } from "mobx";
import { electronStore, LOCAL_SERVER_URL } from "../../config";

export default class StandaloneStore {
  @action
  setMining = (mine: boolean, privateKey: string) => {
    electronStore.set("NoMiner", !mine);
    return fetch(`http://${LOCAL_SERVER_URL}/set-mining`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Mine: mine,
        PrivateKeyString: privateKey,
      }),
    }).then((resp) => this.checkIsOk(resp));
  };

  checkIsOk = async (response: Response) => {
    if (!response.ok) throw new Error(await response.text());
  };
}
