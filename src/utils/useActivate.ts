import { ipcRenderer } from "electron";
import { NodeInfo } from "src/config";
import { getSdk } from "src/generated/graphql-request";
import { useTx } from "src/utils/useTx";
import { useLoginSession } from "./useLoginSession";
import { useStore } from "./useStore";

type ActivationStep =
  | "getActivationInfo"
  | "getGraphQLClient"
  | "getActivationAddress"
  | "createActivateAccountTx"
  | "stageTx";

type ActivationSuccessResult = {
  result: true;
  txId: string;
};

type ActivationFailResult = {
  result: false;
  error: {
    error: unknown;
    step: ActivationStep;
  };
};

type ActivationResult = ActivationSuccessResult | ActivationFailResult;

export function useActivate(): () => Promise<ActivationResult> {
  const tx = useTx();
  const { address, publicKey } = useLoginSession();
  const { activationKey } = useStore("account");

  const activate: () => Promise<ActivationResult> = async () => {
    let step: ActivationStep = "getActivationInfo";

    if (!(address && publicKey)) {
      return {
        result: false,
        error: {
          error: new Error("No address"),
          step,
        },
      };
    }

    if (!activationKey) {
      return {
        result: false,
        error: {
          error: new Error("No activation key"),
          step,
        },
      };
    }

    try {
      step = "getGraphQLClient";
      const nodeInfo: NodeInfo = await ipcRenderer.invoke("get-node-info");
      const sdks = getSdk(nodeInfo.GraphqlClient());

      step = "getActivationAddress";
      const { data: activationData } = await sdks.ActivationAddress({
        address,
      });

      if (activationData.activationStatus.addressActivated) {
        return {
          result: false,
          error: {
            error: new Error("Address Already activated"),
            step,
          },
        };
      }

      step = "createActivateAccountTx";
      const { data: activateData } = await sdks.ActivateAccount({
        activationCode: activationKey,
        publicKey,
      });

      step = "stageTx";
      const { data: txData } = await tx(
        activateData.actionTxQuery.activateAccount
      );

      if (!txData?.stageTransaction) {
        return {
          result: false,
          error: {
            error: new Error("tx staging failed"),
            step,
          },
        };
      }

      return {
        result: true,
        txId: txData.stageTransaction,
      };
    } catch (e: unknown) {
      return {
        result: false,
        error: {
          error: e,
          step: step,
        },
      };
    }
  };

  return activate;
}
