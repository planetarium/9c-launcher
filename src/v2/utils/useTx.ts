import { ipcRenderer } from "electron";
import type { Action } from "src/main/headless/action";
import { tmpName } from "tmp-promise";
import {
  useGetNextTxNonceQuery,
  useStageTxV2Mutation,
} from "../generated/graphql";
import { useStore } from "./useStore";

type PartialTuple<T extends any[]> = T extends [infer A, ...(infer B)]
  ? [A | undefined, ...PartialTuple<B>]
  : [];

type CutLast<T extends any[]> = T extends [...(infer A), infer _] ? A : T;

type ActionArguemnts = {
  "activate-account": CutLast<Parameters<Action["ActivateAccount"]>>;
  "monster-collect": CutLast<Parameters<Action["MonsterCollect"]>>;
  "claim-monster-collection-reward": CutLast<
    Parameters<Action["ClaimMonsterCollectionReward"]>
  >;
  "transfer-asset": CutLast<Parameters<Action["TransferAsset"]>>;
  stake: CutLast<Parameters<Action["Stake"]>>;
  "claim-stake-reward": CutLast<Parameters<Action["ClaimStakeReward"]>>;
};

type Result = ReturnType<ReturnType<typeof useStageTxV2Mutation>[0]>;

/**
 * A helper hook that creates and stages a transaction.
 *
 * @param event An action to stage.
 * @param args Arguments to pass to the action.
 * @returns A async function that stages the transaction when called.
 */
export function useTx<K extends keyof ActionArguemnts>(
  event: K,
  ...args: PartialTuple<ActionArguemnts[K]>
): () => Result {
  const accountStore = useStore("account");
  const { refetch } = useGetNextTxNonceQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });

  const [stage] = useStageTxV2Mutation();

  if (args.some((arg) => arg == undefined))
    return () => Promise.reject(new Error("Missing arguments"));
  else
    return async () => {
      const txFile = await tmpName();
      const txSuccess = ipcRenderer.sendSync(event, ...[...args, txFile]);
      if (!txSuccess) throw new Error("Transaction failed");

      const { data, error } = await refetch();
      if (error) throw error;
      const nonce = data.transaction.nextTxNonce;
      const { status, stdout: encodedTx, stderr } = ipcRenderer.sendSync(
        "sign-tx",
        nonce,
        new Date().toISOString(),
        txFile
      );

      if (status) throw new Error(stderr);

      return await stage({
        variables: {
          encodedTx,
        },
      });
    };
}
