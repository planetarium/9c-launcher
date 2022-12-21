import { signTransaction } from "@planetarium/sign";
import { useRef } from "react";
import { useStageTransactionMutation } from "../generated/graphql";
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

type Result = ReturnType<ReturnType<typeof useStageTransactionMutation>[0]>;

/**
 * A helper hook that creates and stages a transaction.
 *
 * @param event An action to stage.
 * @param args Arguments to pass to the action.
 * @returns A async function that stages the transaction when called.
 */
export async function useTx(): (tx: string) => Result {
  const inProgress = useRef(false);
  const account = useStore("account");
  const [stage] = useStageTransactionMutation();
  return async (tx: string) => {
    if (inProgress.current) throw new Error("Already in progress.");
    else inProgress.current = true;

    try {
      const encodedTx = await signTransaction(tx, account.account);
      return await stage({
        variables: {
          payload: encodedTx,
        },
      }).then((res) => {
        if (res.data) {
          console.log(res.data.stageTransaction);
        }
        return res;
      });
    } finally {
      inProgress.current = false;
    }
  };
}
