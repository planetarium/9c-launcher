import { ipcRenderer } from "electron";
import { NodeInfo } from "src/config";
import { getSdk } from "src/generated/graphql-request";
import { useTx } from "src/utils/useTx";
import { useLoginSession } from "./useLoginSession";

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

type ActivationFunction = (activationKey: string) => Promise<ActivationResult>;

export function useActivate(): ActivationFunction {
  const tx = useTx();
  const { address, publicKey } = useLoginSession();

  const activate: ActivationFunction = async (activationKey: string) => {
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
