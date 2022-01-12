import { useEffect, useState } from "react";
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

export function useActivation(activationKey: string | undefined): ActivationResult {
  const accountStore = useStore("account");
  const { loading, data, startPolling, stopPolling } = useActivationAddressQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
    skip: !accountStore.selectedAddress,
  });

  const { loading: nonceLoading, data: nonceData } = useActivationKeyNonceQuery({
    variables: {
      // @ts-expect-error The query will not run if activationKey is undefined due to the skip option.
      encodedActivationKey: activationKey,
    },
    skip: !activationKey,
  });
  const tx = useTx(
    "activate-account",
    activationKey,
    nonceData?.activationKeyNonce
  );

  useEffect(() => {
    if (
      !data?.activationStatus.addressActivated &&
      activationKey &&
      nonceData?.activationKeyNonce
    ) {
      tx().then(() => startPolling(1000));
    }
  }, [activationKey, tx, nonceData]);

  useEffect(() => {
    if (data?.activationStatus.addressActivated) {
      stopPolling();
    }
  }, [data]);

  return {
    loading: loading || nonceLoading,
    activated: data?.activationStatus.addressActivated ?? false
  };
}
