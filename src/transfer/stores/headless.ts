import Decimal from "decimal.js";
import { ipcRenderer } from "electron";
import { observable, action, decorate } from "mobx";
import { sleep } from "src/utils";
import headlessGraphQLSDK, { GraphQLSDK } from "../middleware/graphql";
import { tmpName } from "tmp-promise";
import {
  useGetNextTxNonceQuery,
  useStageTxV2Mutation,
} from "../../generated/graphql";
import { useState } from "react";

export interface IHeadlessStore {
  balance: Decimal;
  assertAgentAddress: () => void;
  getBalance: () => Promise<Decimal>;
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

  assertAgentAddressV2 = (signer: string): void => {
    if (signer === "") {
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
    signer: string,
    recipient: string,
    amount: Decimal,
    memo: string
  ): Promise<TxId> => {
    this.assertAgentAddressV2(signer);
    const [tx, setTx] = useState("");
    const [transfer] = useStageTxV2Mutation({
      variables: {
        encodedTx: tx,
      },
    });

    const { refetch: txNonceRefetch } = useGetNextTxNonceQuery({
      variables: {
        address: signer,
      },
    });

    async function makeTx(
      signer: string,
      recipient: string,
      amount: Decimal,
      memo: string
    ) {
      // create action.
      const fileName = await tmpName();
      if (
        !ipcRenderer.sendSync(
          "transfer-asset",
          signer,
          recipient,
          amount,
          memo,
          fileName
        )
      ) {
        return;
      }

      // get tx nonce.
      const ended = async () => {
        return await txNonceRefetch({ address: signer });
      };
      let txNonce;
      try {
        let res = await ended();
        txNonce = res.data.transaction.nextTxNonce;
      } catch (e) {
        alert(e.message);
        return;
      }

      // sign tx.
      const result = ipcRenderer.sendSync(
        "sign-tx",
        txNonce,
        new Date().toISOString(),
        fileName
      );

      if (result.stderr != "") {
        alert(result.stderr);
        return;
      }

      if (result.stdout != "") {
        setTx(result.stdout);
      }

      return;
    }

    await makeTx(signer, recipient, amount, memo);
    const transferResult = await transfer();
    if (transferResult.data == null) {
      alert("failed ncg transfer.");
      throw new Error("Failed to create transaction.");
    }

    return transferResult.data.stageTxV2 as string;
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
  updateBalance = async (): Promise<Decimal> => {
    const balance = await this.getBalance();
    this.balance = balance;
    return balance;
  };
}
