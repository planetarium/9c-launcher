import Decimal from "decimal.js";
import { ipcRenderer } from "electron";
import { observable, action, decorate } from "mobx";
import { sleep } from "src/utils";
import headlessGraphQLSDK, { GraphQLSDK } from "../middleware/graphql";

export interface IHeadlessStore {
  balance: Decimal;
  assertAgentAddress: () => void;
  getBalance: () => Promise<Decimal>;
  getAgentAddress: () => string;
  trySetAgentAddress: () => Promise<boolean>;
  transferGold: (
    recipient: string,
    amount: Decimal,
    memo: string
  ) => Promise<string>;
  swapToWNCG: (recipient: string, amount: Decimal) => Promise<string>;
  confirmTransaction: (
    txId: TxId,
    timeout: number | undefined,
    listener: TransactionConfirmationListener
  ) => Promise<void>;
  updateBalance: () => Promise<Decimal>;
}

type TxExecutionCallback = (blockIndex: number, blockHash: string) => void;
export interface TransactionConfirmationListener {
  onSuccess: TxExecutionCallback;
  onFailure: TxExecutionCallback;
  onTimeout: TxExecutionCallback;
}

type TxId = string;

export default class HeadlessStore implements IHeadlessStore {
  private agentAddress: string = "";
  private bridgeAddress: string = "";
  private graphqlSdk: GraphQLSDK;
  @observable public balance: Decimal;

  constructor(sdk: GraphQLSDK, bridgeAddress: string) {
    this.graphqlSdk = sdk;
    this.bridgeAddress = bridgeAddress;
    this.balance = new Decimal(0);
  }

  assertAgentAddress = (): void => {
    if (this.agentAddress === "") {
      throw new Error("Agent address is empty");
    }
  };

  getBalance = async (): Promise<Decimal> => {
    this.assertAgentAddress();
    const balance = await this.graphqlSdk.GetNCGBalance({
      address: this.agentAddress,
    });
    if (balance.data) {
      return new Decimal(balance.data.goldBalance);
    }
    return new Decimal(0);
  };

  @action
  getAgentAddress = () => {
    return this.agentAddress;
  };

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
  transferGold = async (
    recipient: string,
    amount: Decimal,
    memo: string
  ): Promise<TxId> => {
    this.assertAgentAddress();

    const nextTxNonceData = await this.graphqlSdk.GetNextTxNonce({
      address: this.agentAddress,
    });
    if (!nextTxNonceData.data) {
      throw new Error("Failed to get next nonce");
    }
    const txNonce = nextTxNonceData.data.transaction.nextTxNonce as string;
    const tx = await this.graphqlSdk.Transfer({
      recipient,
      amount: amount.toString(),
      memo,
      txNonce,
    });
    if (!tx.data) {
      throw new Error(`Failed to create transaction. ${tx.errors}`);
    }

    return tx.data.transfer;
  };

  @action
  swapToWNCG = async (recipient: string, amount: Decimal): Promise<TxId> => {
    return await this.transferGold(this.bridgeAddress, amount, recipient);
  };

  @action
  confirmTransaction = async (
    txId: TxId,
    timeout: number | undefined,
    listener: {
      onSuccess: TxExecutionCallback;
      onFailure: TxExecutionCallback;
      onTimeout: TxExecutionCallback;
    }
  ): Promise<void> => {
    const txStatus = await this.graphqlSdk.TransactionResult({ txId });
    if (!txStatus.data) {
      throw new Error("Failed to get transaction status");
    }

    const { onSuccess, onFailure, onTimeout } = listener;

    const startTime = Date.now();

    let txResult = txStatus.data.transaction.transactionResult;
    while (true) {
      switch (txResult.txStatus) {
        case "SUCCESS":
          onSuccess(txResult.blockIndex, txResult.blockHash as string);
          return;
        case "FAILURE":
          onFailure(txResult.blockIndex, txResult.blockHash as string);
          return;
        case "INVALID":
        case "STAGING":
          if (timeout) {
            const elapsed = Date.now() - startTime;
            if (elapsed >= timeout) {
              onTimeout(txResult.blockIndex, txResult.blockHash as string);
              return;
            }
          }
          txResult = await (
            await this.graphqlSdk.TransactionResult({ txId })
          ).data!.transaction.transactionResult;
          break;
        default:
          throw new Error(`Unknown transaction status: ${txResult.txStatus}`);
      }
      await sleep(1000);
    }
  };

  @action
  updateBalance = async (): Promise<Decimal> => {
    const balance = await this.getBalance();
    this.balance = balance;
    return balance;
  };
}
