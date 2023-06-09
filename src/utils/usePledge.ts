import { ipcRenderer } from "electron";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "src/generated/graphql-request";
import { get, NodeInfo } from "src/config";
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

  const activate: ActivationFunction = async (requestPledgeTxId: string) => {
    let step: ActivationStep = "preflightCheck";

    if (!account.loginSession) {
      return {
        result: false,
        error: {
          error: new Error("No private key"),
          step,
        },
      };
    }

    step = "getGraphQLClient";
    const nodeInfo: NodeInfo = await ipcRenderer.invoke("get-node-info");

    const sdks = getSdk(
      new GraphQLClient(
        `http://${nodeInfo.host}:${nodeInfo.graphqlPort}/graphql`
      )
    );

    try {
      const { data } = await sdks.CheckContracted({
        agentAddress: account.loginSession.address.toHex(),
      });
      const { contracted, patronAddress } = data.stateQuery.contracted;
      if (!contracted) {
        if (patronAddress === null) {
          step = "checkPledgeRequestTx";

          fetchStatus({ variables: { txId: requestPledgeTxId } });

          while (
            loading ||
            txState?.transaction.transactionResult.txStatus !== "SUCCESS"
          ) {
            switch (txState?.transaction.transactionResult.txStatus) {
              case "FAILURE":
                return {
                  result: false,
                  error: {
                    error: new Error("RequestPledge Tx Staging Failed."),
                    step,
                  },
                };
              case "INVALID":
              case "STAGING":
                break;
            }
            await sleep(1000);
            //TODO: Timeout
          }
        }
        step = "createApprovePledgeTx";
        const { data } = await sdks.approvePledge({
          publicKey: account.loginSession.publicKey.toHex("uncompressed"),
        });

        if (!data?.actionTxQuery.approvePledge) {
          return {
            result: false,
            error: {
              error: new Error("ApprovePledge ActionTxQuery Failed"),
              step,
            },
          };
        }

        step = "stageTx";
        const { data: txData } = await tx(data?.actionTxQuery.approvePledge);
        if (!txData?.stageTransaction) {
          return {
            result: false,
            error: {
              error: new Error("Tx Staging Failed"),
              step,
            },
          };
        }
        return {
          result: true,
          txId: txData.stageTransaction,
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
