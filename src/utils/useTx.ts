import { signTransaction } from "@planetarium/sign";
import { useRef } from "react";
import { useStageTransactionMutation } from "src/generated/graphql";
import { useStore } from "./useStore";

/**
 * A special placeholder value to provide the required value at call time.
 * You can use this value in place of another argument to specify that the value will be provided later.
 *
 * ```ts
 * const tx = useTx();
 *
 * return <button onClick={() => tx(hexEncodedstakeTxPayload)}>Stake</button>
 * ```
 */

type Result = ReturnType<ReturnType<typeof useStageTransactionMutation>[0]>;

/**
 * A helper hook that creates and stages a transaction.
 *
 * @returns A async function that stages the transaction when called.
 */
export function useTx(): (tx: string) => Result {
  const accountStore = useStore("account");
  const inProgress = useRef(false);
  const [stage] = useStageTransactionMutation();

  return async (tx: string) => {
    const account = accountStore.loginSession?.account;
    if (inProgress.current) throw new Error("Already in progress.");
    if (!account) throw new Error("There is no logged in account.");
    else inProgress.current = true;

    try {
      const encodedTx = await signTransaction(tx, account);
      return await stage({
        variables: {
          payload: encodedTx,
        },
      });
    } finally {
      inProgress.current = false;
    }
  };
}
