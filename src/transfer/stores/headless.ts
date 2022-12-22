import Decimal from "decimal.js";
import { ipcRenderer } from "electron";
import { observable, action, decorate } from "mobx";
import { sleep } from "src/utils";
import { GraphQLSDK } from "../middleware/graphql";
import { tmpName } from "tmp-promise";
import { signTransaction, Account } from "@planetarium/sign";
import { createAccount } from "@planetarium/account-raw";

export interface IHeadlessStore {
  balance: Decimal;
  assertAgentAddress: () => void;
  assertAgentAddressV2: (signer: string) => void;
  getBalance: (agentAdress: string) => Promise<Decimal>;
  getAgentAddress: () => string;
  trySetAgentAddress: (agentAddress: string) => Promise<boolean>;
  transferGold: (
    signer: string,
    recipient: string,
    amount: Decimal,
    memo: string
  ) => Promise<string>;
  swapToWNCG: (
    signer: string,
    recipient: string,
    amount: Decimal
  ) => Promise<string>;
  confirmTransaction: (
    txId: TxId,
    timeout: number | undefined,
    listener: TransactionConfirmationListener
  ) => Promise<void>;
  updateBalance: (agentAddress: string) => Promise<Decimal>;
  updateSdk: (sdk: GraphQLSDK) => void;
  updateAccount: (account: Account) => void;
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
  private account: Account = createAccount();
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

  assertAgentAddressV2 = (signer: string): void => {
    if (signer === "") {
      throw new Error("Agent address is empty");
    }
  };

  getBalance = async (agentAddress: string): Promise<Decimal> => {
    this.assertAgentAddressV2(agentAddress);
    const balance = await this.graphqlSdk.GetNCGBalance({
      address: agentAddress,
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
  trySetAgentAddress = async (agentAddress: string): Promise<boolean> => {
    if (agentAddress === "") {
      throw new Error("Agent address is empty");
    }

    if (agentAddress) {
      this.agentAddress = agentAddress;
      return true;
    }

    return false;
  };

  @action
  transferGold = async (
    sender: string,
    recipient: string,
    amount: Decimal,
    memo: string
  ): Promise<TxId> => {
    if (sender.startsWith("0x")) {
      sender = sender.replace("0x", "");
    }
    if (recipient.startsWith("0x")) {
      recipient = recipient.replace("0x", "");
    }

    this.assertAgentAddressV2(sender);

    return this.account
      .getPublicKey()
      .then((v) =>
        this.graphqlSdk.transferAsset({
          publicKey: Buffer.from(v).toString("hex"),
          sender: sender,
          recipient: recipient,
          amount: amount.toString(),
          memo: memo,
        })
      )
      .catch((e) => {
        console.error(e);
        throw new Error("Failed to create transfer asset action.");
      })
      .then(
        (v) =>
          v.data.actionTxQuery.transferAsset &&
          signTransaction(v.data.actionTxQuery.transferAsset, this.account)
      )
      .catch((e) => {
        console.error(e);
        throw new Error("Failed to sign transaction.");
      })
      .then((v) => {
        if (v !== "string") {
          throw new Error("Signed transaction not provided.");
        }
        return this.graphqlSdk.stageTransaction({ payload: v });
      })
      .then((v) => {
        if (!v.data) throw new Error("Failed to stage transaction.");
        return v.data.stageTransaction as string;
      });
  };

  @action
  swapToWNCG = async (
    signer: string,
    recipient: string,
    amount: Decimal
  ): Promise<TxId> => {
    return await this.transferGold(
      signer,
      this.bridgeAddress,
      amount,
      recipient
    );
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
  updateBalance = async (agentAddress: string): Promise<Decimal> => {
    const balance = await this.getBalance(agentAddress);
    this.balance = balance;
    return balance;
  };

  @action
  updateSdk = (sdk: GraphQLSDK) => {
    this.graphqlSdk = sdk;
  };

  @action
  updateAccount = (account: Account) => {
    this.account = account;
  };
}
