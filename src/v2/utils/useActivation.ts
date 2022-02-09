import { useEffect, useReducer, useState } from "react";
import {
  useActivationAddressQuery,
  useActivationKeyNonceQuery,
} from "../generated/graphql";
import { useStore } from "./useStore";
import { useTx } from "./useTx";

interface ActivationResult {
  loading: boolean;
  activated: boolean;
}

/**
 * A helper hook which has two jobs to do.
 * 1. It queries the activation atatus of the current account.
 * 2. When the activationKey is provided, it will stage a transaction to activate the account.
 *
 * @param activationKey An activation key to use for automatic activation. Pass `undefined` to disable automatic activation.
 * @returns {ActivationResult} A object with two properties: `loading` and `activated`. They are pretty self-explanatory.
 */
export function useActivation(activationKey?: string): ActivationResult {
  const accountStore = useStore("account");
  const [isPolling, setPolling] = useState(false);
  const { loading, data } = useActivationAddressQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
    pollInterval: isPolling ? 1000 : undefined,
    skip: !accountStore.isLogin,
  });

  const { loading: nonceLoading, data: nonceData } = useActivationKeyNonceQuery(
    {
      variables: {
        // @ts-expect-error The query will not run if activationKey is undefined due to the skip option.
        encodedActivationKey: activationKey,
      },
      skip: !activationKey,
    }
  );
  const tx = useTx(
    "activate-account",
    activationKey,
    nonceData?.activationKeyNonce
  );

  useEffect(() => {
    if (
      !data?.activationStatus.addressActivated &&
      activationKey &&
      nonceData?.activationKeyNonce &&
      !isPolling
    ) {
      setPolling(true);
      tx()
        .then((v) => {
          if (v.data?.stageTxV2) {
            console.log(v.data?.stageTxV2);
            return;
          }
          setPolling(false);
          console.error(v);
        })
        .catch((e) => {
          setPolling(false);
          console.error(e);
        });
    }
  }, [activationKey, tx, nonceData, isPolling]);

  useEffect(() => {
    if (data?.activationStatus.addressActivated) setPolling(false);
  }, [data]);

  return {
    loading: loading || nonceLoading,
    activated: data?.activationStatus.addressActivated ?? false,
  };
}
