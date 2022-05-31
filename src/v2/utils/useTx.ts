import { ipcRenderer } from "electron";
import type { Action } from "src/main/headless/action";
import { tmpName } from "tmp-promise";
import {
  useGetNextTxNonceQuery,
  useStageTxV2Mutation,
} from "../generated/graphql";
import { useStore } from "./useStore";

/**
 * A special placeholder value to provide the required value at call time.
 * You can use this value in place of another argument to specify that the value will be provided later.
 *
 * ```ts
 * const tx = useTx("stake", placeholder);
 *
 * return <button onClick={() => tx(1)}>Stake</button>
 * ```
 */
export const placeholder = Symbol("v2 useTx placeholder");

type PartialTuple<T extends any[]> = T extends [infer A, ...(infer B)]
  ? [A | undefined | typeof placeholder, ...PartialTuple<B>]
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

type Replacers<
  Original extends any[],
  Provided extends any[]
> = Provided extends [infer ProvidedValue, ...(infer ProvidedRest)]
  ? Original extends [infer OriginalValue, ...(infer OriginalRest)]
    ? ProvidedValue extends typeof placeholder
      ? [OriginalValue, ...Replacers<OriginalRest, ProvidedRest>]
      : [...Replacers<OriginalRest, ProvidedRest>]
    : []
  : [];

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
): (...replacers: Replacers<ActionArguemnts[K], typeof args>) => Result {
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
    return async (...replacers) => {
      const txFile = await tmpName();
      const parameters = args
        .map((v) => (v === placeholder ? replacers.shift() : v))
        .concat(txFile);
      const txSuccess = ipcRenderer.sendSync(event, ...parameters);
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
      const trimmed: string = encodedTx.trim().replace(/.+\r?\n/g, "");

      return await stage({
        variables: {
          encodedTx: trimmed,
        },
      }).then((res) => {
        if (res.data) console.log(event, parameters, res.data.stageTxV2);
        return res;
      });
    };
}
