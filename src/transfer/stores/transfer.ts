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
  getAgentAddress = () => {
    return this.agentAddress;
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
    this.checkAgentAddress();

    const nextTxNonceData = await this.graphqlSdk.GetNextTxNonce({address: this.agentAddress});
    if (!nextTxNonceData.data) {
      throw new Error("Failed to get next nonce");
    }
    const txNonce = nextTxNonceData.data.transaction.nextTxNonce as string;
    const tx = await this.graphqlSdk.Transfer({recipient, amount: amount.toString(), memo, txNonce});

    return false;
  }

  @action
  swapToWNCG = async (recipient: string, amount: number): Promise<boolean> => {
    const bridgeAddress = "0xa208a3E10964dd8bB044a87a31967bafd9458907"; // testnet
    return await this.transferGold(bridgeAddress, amount, recipient);
  }
  
  @action 
  getBalance = async (address: string): Promise<number> => {
    this.checkAgentAddress();
    const balance = await this.graphqlSdk.GetNCGBalance({address: address});
    if(balance.data) {
      return parseFloat(balance.data.goldBalance);
    }
    return 0;
  }
}
