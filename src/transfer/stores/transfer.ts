import { ipcRenderer } from "electron";
import { observable, action, decorate } from "mobx";
import headlessGraphQLSDK, { GraphQLSDK } from "../middleware/graphql";

export interface ITransferStore {
}


export default class TransferStore implements ITransferStore {
  private agentAddress: string = "";
  private graphqlSdk: GraphQLSDK;

  constructor(sdk: GraphQLSDK) {
    this.graphqlSdk = sdk;
  }

  checkAgentAddress = (): void => {
    if (this.agentAddress === "") {
      throw new Error("Agent address is empty");
    }
  }

  @action
  trySetAgentAddress = async (): Promise<boolean> => {
    const minerAddress = await this.graphqlSdk.MinerAddress();
    if (minerAddress.data) {
      this.agentAddress = minerAddress.data.minerAddress;
      return true;
    }

    return false;
  };

  @action
  transferGold = async (recipient: string, amount: number, memo: string): Promise<boolean> => {

    return false;
  }

  @action
  swapToWNCG = async (recipient: string, amount: number): Promise<boolean> => {
    const bridgeAddress = "";
    return this.transferGold(bridgeAddress, amount, recipient);
  }
}
