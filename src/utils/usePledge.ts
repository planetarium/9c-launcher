import { get } from "src/config";
import {
  ActivationFunction,
  ActivationStep,
  ActivationSuccessResult,
} from "src/interfaces/activation";
import { useTx } from "src/utils/useTx";
import { useStore } from "./useStore";
import {
  useApprovePledgeLazyQuery,
  useTransactionResultLazyQuery,
} from "src/generated/graphql";
import { sleep } from "src/utils";
import { useCheckContract } from "./useCheckContract";

export function usePledge(): ActivationFunction {
  const tx = useTx();
  const account = useStore("account");
  const { approved, requested } = useCheckContract();

  const [fetchStatus, { loading, data: txState, stopPolling }] =
    useTransactionResultLazyQuery({
      pollInterval: 1000,
      fetchPolicy: "no-cache",
    });
  const [approve, { data }] = useApprovePledgeLazyQuery();

  const activate: ActivationFunction = async () => {
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

    if (!account.activationCode) {
      return {
        result: false,
        error: {
          error: new Error("No activation key"),
          step,
        },
      };
    }

    try {
      if (!approved) {
        if (!requested) {
          step = "requestPortalPledge";
          const res = await fetch(
            get("OnboardingPortalUrl") + "/api/account/contract",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                activationCode: account.activationCode,
                address: account.loginSession!.address.toHex(),
              }),
            }
          );
          if (!res.ok) {
            return {
              result: false,
              error: {
                error: new Error("RequestPledge to Portal Failed"),
                step,
              },
            };
          }
          step = "checkPledgeRequestTx";

          fetchStatus({ variables: { txId: await res.text() } });

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
        await approve({
          variables: {
            publicKey: account.loginSession!.publicKey.toHex("uncompressed"),
          },
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
        const txData = await tx(data?.actionTxQuery.approvePledge);
        if (!txData?.data?.stageTransaction) {
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
          txId: txData.data.stageTransaction,
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
