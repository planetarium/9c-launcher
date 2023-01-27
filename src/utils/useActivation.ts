import { useEffect, useState } from "react";
import {
  useActivateAccountLazyQuery,
  useActivationAddressQuery,
  useActivationKeyNonceQuery,
} from "src/generated/graphql";
import { useIsHeadlessAvailable } from "./useIsHeadlessAvailable";
import { useStore } from "./useStore";
import { useTx } from "src/utils/useTx";
import { useLoginSession } from "./useLoginSession";

interface ActivationResult {
  loading: boolean;
  error: boolean;
  activated: boolean;
}

/**
 * A helper hook which has two jobs to do.
 * 1. It queries the activation status of the current account.
 * 2. When the activationKey is provided, it will stage a transaction to activate the account.
 *
 * @returns {ActivationResult} A object with two properties: `loading` and `activated`. They are pretty self-explanatory.
 */

// FIXME Divide this hook onto query and mutation instead of flag
export function useActivation(doActivate: boolean): ActivationResult {
  const { address, publicKey } = useLoginSession();
  const accountStore = useStore("account");
  const isAvailable = useIsHeadlessAvailable();
  const [activateAccountTxId, setActivateAccountTxId] = useState<string>();
  const [txError, setTxError] = useState<Error | undefined>();
  const { loading, data, error } = useActivationAddressQuery({
    variables: {
      address,
    },
    pollInterval: activateAccountTxId ? 1000 : undefined,
    skip: !address,
  });
  const tx = useTx();
  const activated = data?.activationStatus.addressActivated ?? false;

  const {
    loading: nonceLoading,
    data: nonceData,
    error: nonceError,
  } = useActivationKeyNonceQuery({
    variables: {
      encodedActivationKey: accountStore.activationKey,
    },
    skip: !accountStore.activationKey,
  });
  const [
    requestActivateAccountTx,
    {
      called: activateAccountTxCalled,
      loading: activateAccountTxLoading,
      error: activateAccountTxError,
    },
  ] = useActivateAccountLazyQuery({
    fetchPolicy: "network-only",
    onCompleted: ({ actionTxQuery: { activateAccount } }) => {
      tx(activateAccount)
        .then((res) => {
          if (res.data?.stageTransaction) {
            setActivateAccountTxId(res.data.stageTransaction);
          }
        })
        .catch((e) => {
          setTxError(e);
        });
    },
  });

  useEffect(() => {
    if (nonceData?.activated) {
      setTxError(new Error("Already activated."));
      return;
    }

    if (!doActivate) {
      return;
    }

    if (
      !activated &&
      !activateAccountTxCalled &&
      !activateAccountTxLoading &&
      publicKey &&
      accountStore.activationKey &&
      nonceData?.activationKeyNonce
    ) {
      requestActivateAccountTx({
        variables: {
          publicKey,
          activationCode: accountStore.activationKey,
        },
      });
    }
  }, [
    accountStore.activationKey,
    requestActivateAccountTx,
    nonceData,
    activated,
    publicKey,
    activateAccountTxCalled,
    doActivate,
    activateAccountTxLoading,
  ]);

  return {
    loading:
      loading || nonceLoading || !isAvailable || activateAccountTxLoading,
    error: Boolean(txError || error || nonceError || activateAccountTxError),
    activated,
  };
}
