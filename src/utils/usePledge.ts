import { get } from "src/config";
import { ActivationFunction, ActivationStep } from "src/interfaces/activation";
import { useTx } from "src/utils/useTx";
import { useStore } from "./useStore";
import {
  useApprovePledgeLazyQuery,
  useTransactionResultLazyQuery,
} from "src/generated/graphql";
import { sleep } from "src/utils";

export function usePledge(): ActivationFunction {
  const tx = useTx();
  const account = useStore("account");
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
      step = "requestPortalPledge";
      const res = await fetch(
        get("OnboardingPortalUrl") +
          "/api/account/contract?" +
          new URLSearchParams({
            address: account.loginSession!.address.toHex(),
            activationCode: account.activationCode,
          }).toString(),
        {
          method: "POST",
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
      }

      step = "createApprovePledgeTx";
      await approve({
        variables: {
          publicKey: account.loginSession.publicKey.toHex("compressed"),
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
        txId: txData.data?.stageTransaction,
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
