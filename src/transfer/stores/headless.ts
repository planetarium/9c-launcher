import { ipcRenderer } from "electron";
import { observable, action, decorate } from "mobx";
import { sleep } from "src/utils";
import headlessGraphQLSDK, { GraphQLSDK } from "../middleware/graphql";

export interface IHeadlessStore {
  balance: number;
  assertAgentAddress: () => void;
  getBalance: () => Promise<number>;
  getAgentAddress: () => string;
  trySetAgentAddress: () => Promise<boolean>;
  transferGold: (recipient: string, amount: number, memo: string) => Promise<string>;
  swapToWNCG: (recipient: string, amount: number) => Promise<string>;
  confirmTransaction: (
    txId: string,
    timeout: number | undefined,
    onSuccess: TxExecutionCallback,
    onFailure: TxExecutionCallback,
    onTimeout: TxExecutionCallback) => Promise<void>;
  updateBalance: () => Promise<number>
}

type TxExecutionCallback = (blockIndex: number, blockHash: string) => void;

export default class HeadlessStore implements IHeadlessStore {
  private agentAddress: string = "";
  private graphqlSdk: GraphQLSDK;
  @observable public balance: number = 0;

  constructor(sdk: GraphQLSDK) {
    this.graphqlSdk = sdk;
  }

  assertAgentAddress = (): void => {
    if (this.agentAddress === "") {
      throw new Error("Agent address is empty");
    }
  }

  getBalance = async (): Promise<number> => {
    this.assertAgentAddress();
    const balance = await this.graphqlSdk.GetNCGBalance({address: this.agentAddress});
    if(balance.data) {
      return parseFloat(balance.data.goldBalance);
    }
    return 0;
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
  transferGold = async (recipient: string, amount: number, memo: string): Promise<string> => {
    this.assertAgentAddress();

    const nextTxNonceData = await this.graphqlSdk.GetNextTxNonce({address: this.agentAddress});
    if (!nextTxNonceData.data) {
      throw new Error("Failed to get next nonce");
    }
    const txNonce = nextTxNonceData.data.transaction.nextTxNonce as string;
    const tx = await this.graphqlSdk.Transfer({recipient, amount: amount.toString(), memo, txNonce});
    if (!tx.data) {
      throw new Error(`Failed to create transaction. ${tx.errors}`);
    }

    return tx.data.transfer;
  }

  @action
  swapToWNCG = async (recipient: string, amount: number): Promise<string> => {
    const bridgeAddress = "0xa208a3E10964dd8bB044a87a31967bafd9458907"; // testnet
    return await this.transferGold(bridgeAddress, amount, recipient);
  }

  @action
  confirmTransaction = async (
    txId: string,
    timeout: number | undefined,
    onSuccess: TxExecutionCallback,
    onFailure: TxExecutionCallback,
    onTimeout: TxExecutionCallback): Promise<void> => {
    const txStatus = await this.graphqlSdk.TransactionResult({txId});
    if (!txStatus.data) {
      throw new Error("Failed to get transaction status");
    }

    const startTime = Date.now();

    let txResult = txStatus.data.transaction.transactionResult;
    while(true) {
      switch(txResult.txStatus) {
        case "SUCCESS":
          onSuccess(txResult.blockIndex, txResult.blockHash as string);
          return;
        case "FAILURE":
          onFailure(txResult.blockIndex, txResult.blockHash as string);
          return;
        case "INVALID":
        case "STAGNING":
          if(timeout) {
            const elapsed = Date.now() - startTime;
            if(elapsed >= timeout) {
              onTimeout(txResult.blockIndex, txResult.blockHash as string);
              return;
            }
          }
          txResult = await (await this.graphqlSdk.TransactionResult({txId})).data!.transaction.transactionResult;
          break;
        default:
          throw new Error(`Unknown transaction status: ${txResult.txStatus}`);
      }
      await sleep(1000);
    }
  }
  
  @action 
  updateBalance = async (): Promise<number> => {
    const balance = await this.getBalance();
    this.balance = balance;
    return balance;
  }
}
