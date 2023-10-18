import { ipcRenderer } from "electron";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "src/generated/graphql-request";
import { NodeInfo } from "src/config";
import { ActivationFunction, ActivationStep } from "src/interfaces/activation";
import { useTx } from "src/utils/useTx";
import { useStore } from "./useStore";

export function usePledge() {
  const tx = useTx();
  const account = useStore("account");
  const planet = useStore("planetary");

  const activate: ActivationFunction = async () => {
    let step: ActivationStep = "getGraphQLClient";
    const sdks = getSdk(new GraphQLClient(planet.node.gqlUrl));

    try {
      step = "preflightCheck";
      if (!account.loginSession) {
        throw new Error("No private key");
      }
      const { data } = await sdks.CheckContracted({
        agentAddress: account.loginSession.address.toHex(),
      });
      const { approved } = data.stateQuery.pledge;
      let { patronAddress } = data.stateQuery.pledge;

      if (!approved) {
        if (patronAddress === null) {
          step = "checkRequestPledge";
          await new Promise<void>((resolve, reject) => {
            const intervalId = setInterval(async () => {
              const { data } = await sdks.CheckContracted({
                agentAddress: account.loginSession!.address.toHex(),
              });
              if (data.stateQuery.pledge.patronAddress !== null) {
                patronAddress = data.stateQuery.pledge.patronAddress;
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                resolve();
              }
            }, 1000);

            const timeoutId = setTimeout(() => {
              clearInterval(intervalId);
              reject(new Error("Contract Check Timeout."));
            }, 120000);
          });
        }

        if (patronAddress !== undefined && patronAddress !== null) {
          step = "createApprovePledgeTx";
          const { data: approvePledgeTx } = await sdks.approvePledge({
            publicKey: account.loginSession.publicKey.toHex("uncompressed"),
            patronAddress,
          });

          if (!approvePledgeTx?.actionTxQuery.approvePledge) {
            throw new Error("ApprovePledge ActionTxQuery Failed");
          }

          step = "stageApprovePledgeTx";
          const { data: txData } = await tx(
            approvePledgeTx?.actionTxQuery.approvePledge,
          );
          if (!txData?.stageTransaction) {
            throw Error("Tx Staging Failed");
          }
          console.log(`Staging approvePledge Tx: ${txData.stageTransaction}`);
          await new Promise<void>((resolve, reject) => {
            const intervalId = setInterval(() => {
              sdks
                .TransactionResult({
                  txId: txData.stageTransaction,
                })
                .then(({ data }) => {
                  switch (data.transaction.transactionResult.txStatus) {
                    case "SUCCESS":
                      console.log(
                        `approvePledge Tx Staging Success: ${txData.stageTransaction}`,
                      );
                      clearTimeout(timeoutId);
                      clearInterval(intervalId);
                      resolve();
                      break;
                    case "FAILURE":
                      clearTimeout(timeoutId);
                      clearInterval(intervalId);
                      reject(
                        new Error(
                          `approvePledge Tx Staging Failed: ${txData.stageTransaction}`,
                        ),
                      );
                      break;
                    case "INVALID":
                    case "STAGING":
                      break;
                  }
                });
            }, 1000);

            const timeoutId = setTimeout(() => {
              clearInterval(intervalId);
              reject(new Error("approvePledge Staging Confirmation Timeout."));
            }, 120000);
          });
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
