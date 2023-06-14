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

  const activate: ActivationFunction = async () => {
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
        if (patronAddress === null) {
          step = "checkRequestPledge";
          for (let i = 0; i <= 60; i++) {
            const { data } = await sdks.CheckContracted({
              agentAddress: account.loginSession.address.toHex(),
            });
            if (data.stateQuery.contracted.patronAddress !== null) {
              break;
            }
            if (i === 60) throw new Error("Contract Check Timeout.");
            sleep(1000); // timeout 1 minutes
          }
        }

        step = "createApprovePledgeTx";
        const { data: approvePledgeTx } = await sdks.approvePledge({
          publicKey: account.loginSession.publicKey.toHex("uncompressed"),
        });

        if (!approvePledgeTx?.actionTxQuery.approvePledge) {
          throw new Error("ApprovePledge ActionTxQuery Failed");
        }

        step = "stageApprovePledgeTx";
        const { data: txData } = await tx(
          approvePledgeTx?.actionTxQuery.approvePledge
        );
        if (!txData?.stageTransaction) {
          throw Error("Tx Staging Failed");
        }
        fetchStatus({ variables: { txId: txData.stageTransaction } });
        console.log(`Staging approvePledge Tx: ${txData.stageTransaction}`);
        let pollCount = 0;
        while (loading) {
          pollCount++;
          if (txState?.transaction.transactionResult.txStatus !== undefined) {
            switch (txState?.transaction.transactionResult.txStatus) {
              case "SUCCESS":
                console.log("approvePledge Tx Staging Success.");
                stopPolling?.();
                break;
              case "FAILURE":
                throw Error("approvePledge Tx Staging Failed.");
              case "INVALID":
              case "STAGING":
                break;
            }
          }
          await sleep(1000);
          if (pollCount >= 60) {
            stopPolling?.();
            throw Error("approvePledge Staging Confirmation Timeout.");
          }
        }
        return {
          result: true,
        };
      } else {
        return {
          result: true,
        };
      }
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
