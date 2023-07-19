import Decimal from "decimal.js";
import { observable, action } from "mobx";
import { sleep } from "src/utils";
import { GraphQLClient } from "graphql-request";
import { get as getConfig } from "src/config";
import { getSdk } from "src/generated/graphql-request";
import {
  addUpdatedAddressesToTransactionHex,
  signTransactionHex,
} from "src/utils/sign";
import { Account, Address } from "@planetarium/account";

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
    account: Account
  ) => Promise<string>;
  swapToWNCG: (
    sender: string,
    recipient: string,
    amount: Decimal,
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
    account: Account
  ): Promise<TxId> => {
    if (sender.startsWith("0x")) {
      sender = sender.replace("0x", "");
    }
    if (recipient.startsWith("0x")) {
      recipient = recipient.replace("0x", "");
    }

    if (sender === "") {
      throw new Error("Sender address is empty");
    }

    try {
      const { data } = await this.graphqlSdk.transferAsset({
        publicKey: (await account.getPublicKey()).toHex("uncompressed"),
        sender: sender,
        recipient: recipient,
        amount: amount.toString(),
        memo: memo,
      });
      if (typeof data.actionTxQuery.transferAsset !== "string") {
        throw new Error("ActionTxQuery Failed.");
      }
      const updatedAddresses: Uint8Array[] = [
        Address.fromHex(sender, true).toBytes(),
        Address.fromHex(recipient, true).toBytes(),
      ];

      const signedTx = await signTransactionHex(
        await addUpdatedAddressesToTransactionHex(
          data.actionTxQuery.transferAsset,
          updatedAddresses
        ),
        account
      );
      const TxResult = await this.graphqlSdk.stageTransaction({
        payload: signedTx,
      });
      if (!TxResult.data) throw new Error("Failed to stage transaction.");
      return TxResult.data.stageTransaction as TxId;
    } catch (e: unknown) {
      console.error(e);
    }
    throw new Error("Unknown TransferAsset Failure");
  };

  @action
  swapToWNCG = async (
    sender: string,
    recipient: string,
    amount: Decimal,
    account: Account
  ): Promise<TxId> => {
    return await this.transferAsset(
      sender,
      this.bridgeAddress,
      amount,
      recipient,
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
