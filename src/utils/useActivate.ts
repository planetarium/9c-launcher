import { ipcRenderer } from "electron";
import { GraphQLClient } from "graphql-request";
import { NodeInfo } from "src/config";
import { getSdk } from "src/generated/graphql-request";
import { ActivationFunction, ActivationStep } from "src/interfaces/activation";
import { useTx } from "src/utils/useTx";
import { useLoginSession } from "./useLoginSession";
import { useStore } from "./useStore";

export function useActivate(): ActivationFunction {
  const tx = useTx();
  const { address, publicKey } = useLoginSession();
  const { activationKey } = useStore("account");

  const activate: ActivationFunction = async () => {
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

      const sdks = getSdk(
        new GraphQLClient(
          `http://${nodeInfo.host}:${nodeInfo.graphqlPort}/graphql`
        )
      );

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

      console.log(`Activation Transaction ID: ${txData?.stageTransaction}`);

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
