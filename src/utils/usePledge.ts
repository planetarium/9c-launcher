import { ipcRenderer } from "electron";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "src/generated/graphql-request";
import { NodeInfo } from "src/config";
import { ActivationFunction, ActivationStep } from "src/interfaces/activation";
import { useTx } from "src/utils/useTx";
import { useStore } from "./useStore";
import { useTransactionResultLazyQuery } from "src/generated/graphql";
import { sleep } from "src/utils";

export function usePledge() {
  const tx = useTx();
  const account = useStore("account");

  const [fetchStatus, { loading, data: txState, stopPolling }] =
    useTransactionResultLazyQuery({
      pollInterval: 1000,
      fetchPolicy: "no-cache",
    });

  const TxIdConfirmator = async (txType: string, txId: string) => {
    fetchStatus({ variables: { txId: txId } });
    console.log(`Staging Tx ${txType}: ${txId}`);
    let pollCount = 0;
    while (loading) {
      pollCount++;
      switch (txState?.transaction.transactionResult.txStatus) {
        case "SUCCESS":
          console.log(`${txType} Tx Staging Success.`);
          stopPolling?.();
          break;
        case "FAILURE":
          throw Error(`${txType} Tx Staging Failed.`);
        case "INVALID":
        case "STAGING":
          break;
      }
      await sleep(1000);
      if (pollCount >= 60) {
        stopPolling?.();
        throw Error(`${txType} Staging Confirmation Timeout.`);
      }
    }
  };

  const activate: ActivationFunction = async (
    requestPledgeTxId: string | null
  ) => {
    let step: ActivationStep = "getGraphQLClient";
    const nodeInfo: NodeInfo = await ipcRenderer.invoke("get-node-info");

    const sdks = getSdk(
      new GraphQLClient(
        `http://${nodeInfo.host}:${nodeInfo.graphqlPort}/graphql`
      )
    );

    try {
      step = "preflightCheck";

      if (!account.loginSession) {
        throw new Error("No private key");
      }

      const { data } = await sdks.CheckContracted({
        agentAddress: account.loginSession.address.toHex(),
      });
      const { contracted, patronAddress } = data.stateQuery.contracted;
      if (!contracted) {
        if (patronAddress === null && requestPledgeTxId !== null) {
          //If requestPledgeTxId is null, consider it's approve scenario
          step = "checkPledgeRequestTx";

          await TxIdConfirmator("requestPledge", requestPledgeTxId);
        }
        step = "createApprovePledgeTx";
        const { data: approvePledgeTx } = await sdks.approvePledge({
          publicKey: account.loginSession.publicKey.toHex("uncompressed"),
        });

        if (!approvePledgeTx?.actionTxQuery.approvePledge) {
          throw new Error("ApprovePledge ActionTxQuery Failed");
        }

        step = "stageTx";
        const { data: txData } = await tx(
          approvePledgeTx?.actionTxQuery.approvePledge
        );
        if (!txData?.stageTransaction) {
          throw Error("Tx Staging Failed");
        }
        await TxIdConfirmator("approvePledge", txData.stageTransaction);
        return {
          result: true,
        };
      }
      return {
        result: true,
      };
    } catch (e: unknown) {
      if (e instanceof Error) {
        return {
          result: false,
          error: {
            error: e,
            step: step,
          },
        };
      }
      throw e;
    }
  };
  return activate;
}
