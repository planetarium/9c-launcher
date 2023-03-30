import Decimal from "decimal.js";
import { observable, action } from "mobx";
import { sleep } from "src/utils";
import { GraphQLClient } from "graphql-request";
import { get as getConfig } from "src/config";
import { getSdk } from "src/generated/graphql-request";
import { signTransaction, Account } from "@planetarium/sign";
import { boot, transfer_asset3, Address, Currency } from "lib9c-wasm";
import { encodeUnsignedTxWithCustomActions } from "@planetarium/tx"

type GraphQLSDK = ReturnType<typeof getSdk>;

type TxExecutionCallback = (blockIndex: number, blockHash: string) => void;

type TxId = string;

export interface ITransferStore {
  balance: Decimal;
  getBalance: (senderAdress: string) => Promise<Decimal>;
  trySetSenderAddress: (senderAddress: string) => Promise<boolean>;
  transferAsset: (
    sender: string,
    recipient: string,
    amount: Decimal,
    memo: string,
    publickey: string,
    account: Account
  ) => Promise<string>;
  swapToWNCG: (
    sender: string,
    recipient: string,
    amount: Decimal,
    publickey: string,
    account: Account
  ) => Promise<string>;
  confirmTransaction: (
    txId: TxId,
    timeout: number | undefined,
    listener: TransactionConfirmationListener
  ) => Promise<void>;
  updateBalance: (senderAddress: string) => Promise<Decimal>;
  updateSdk: (sdk: GraphQLSDK) => void;
}

export interface TransactionConfirmationListener {
  onSuccess: TxExecutionCallback;
  onFailure: TxExecutionCallback;
  onTimeout: TxExecutionCallback;
}

export default class TransferStore implements ITransferStore {
  private bridgeAddress: string =
    getConfig("SwapAddress") || "0x9093dd96c4bb6b44A9E0A522e2DE49641F146223";
  @observable public graphqlSdk: GraphQLSDK = getSdk(new GraphQLClient(""));
  @observable public balance: Decimal = new Decimal(0);
  @observable public senderAddress: string = "";
  @observable public senderPublicKey

  @action
  getBalance = async (senderAddress: string): Promise<Decimal> => {
    if (senderAddress === "") {
      throw new Error("Sender address is empty");
    }
    return this.graphqlSdk
      .GetNCGBalance({
        address: senderAddress,
      })
      .then((v) => {
        if (v.data) {
          return new Decimal(v.data.goldBalance);
        }
        return new Decimal(0);
      });
  };

  @action
  trySetSenderAddress = async (senderAddress: string): Promise<boolean> => {
    if (senderAddress === "") {
      throw new Error("Sender address is empty");
    }

    if (senderAddress) {
      this.senderAddress = senderAddress;
      return true;
    }

    return false;
  };

  @action
  transferAsset = async (
    sender: string,
    recipient: string,
    amount: Decimal,
    memo: string,
    publickey: string,
    account: Account
  ): Promise<TxId> => {
    if (!sender.startsWith("0x")) {
      sender = sender.padStart(2, "0x");
    }
    if (!recipient.startsWith("0x")) {
      recipient = recipient.padStart(2, "0x");
    }

    if (sender === "") {
      throw new Error("Sender address is empty");
    }


    return this.graphqlSdk
      .transferAsset({
        publicKey: publickey,
        sender: sender,
        recipient: recipient,
        amount: amount.toString(),
        memo: memo,
      })
      .catch((e) => {
        console.error(e);
        throw new Error("Failed to create transfer asset action.");
      })
      .then(
        (v) =>
          v.data.actionTxQuery.transferAsset &&
          signTransaction(v.data.actionTxQuery.transferAsset, account)
      )
      .catch((e) => {
        console.error(e);
        throw new Error("Failed to sign transaction.");
      })
      .then((v) => {
        if (typeof v !== "string") {
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
    sender: string,
    recipient: string,
    amount: Decimal,
    publickey: string,
    account: Account
  ): Promise<TxId> => {
    return await this.transferAsset(
      sender,
      this.bridgeAddress,
      amount,
      recipient,
      publickey,
      account
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
          break;
        default:
          throw new Error(`Unknown transaction status: ${txResult.txStatus}`);
      }
      txResult = await (
        await this.graphqlSdk.TransactionResult({ txId })
      ).data!.transaction.transactionResult;
      await sleep(1000);
    }
  };

  @action
  updateBalance = async (senderAddress: string): Promise<Decimal> => {
    const balance = await this.getBalance(senderAddress);
    this.balance = balance;
    return balance;
  };

  @action
  updateSdk = (sdk: GraphQLSDK) => {
    this.graphqlSdk = sdk;
  };
}
