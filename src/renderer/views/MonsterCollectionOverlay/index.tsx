import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { MonsterCollectionOverlayBase } from "./base";
import { MonsterCollectionContent } from "./MonsterCollectionContent";
import { OverlayProps } from "src/utils/types";

import { useBalance } from "src/utils/useBalance";
import { useStore } from "src/utils/useStore";
import { useTx } from "src/utils/useTx";
import {
  TxStatus,
  useCurrentStakingQuery,
  useLegacyCollectionStateQuery,
  useStakeLazyQuery,
  useStakingSheetQuery,
  useTransactionResultLazyQuery,
} from "src/generated/graphql";
import Migration from "./Migration";
import { useTip } from "src/utils/useTip";
import { trackEvent } from "src/utils/mixpanel";

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  const account = useStore("account");
  const { data: sheet } = useStakingSheetQuery();
  const { data: current, refetch: refetchStaking } = useCurrentStakingQuery({
    variables: { address: account.address },
    skip: !account.isLogin,
  });
  const { data: collection, refetch: refetchCollection } =
    useLegacyCollectionStateQuery({
      variables: { address: account.address },
      skip: !account.isLogin,
    });
  const balance = useBalance();
  const tip = useTip();

  const tx = useTx();
  const [stake, { data: staked, loading, error }] = useStakeLazyQuery();
  const [isLoading, setLoading] = useState(false);
  const [fetchStatus, { data: txStatus, stopPolling }] =
    useTransactionResultLazyQuery({
      pollInterval: 1000,
    });

  useEffect(() => {
    if (!txStatus) return;
    if (txStatus.transaction.transactionResult.txStatus === TxStatus.Success) {
      refetchStaking();
      refetchCollection();
    }
    if (txStatus.transaction.transactionResult.txStatus !== TxStatus.Staging) {
      stopPolling?.();
      setLoading(false);
    }
  }, [txStatus]);

  if (!sheet || !current || !collection || !tip) return null;

  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} onDismiss={onClose}>
      <MonsterCollectionContent
        sheet={sheet}
        current={current}
        currentNCG={balance}
        onChangeAmount={(amount) => {
          setLoading(true);
          trackEvent("Staking/AmountChange", {
            amount: amount.toString(),
            previousAmount: current.stateQuery.stakeState?.deposit,
          });
          return account
            .getPublicKeyString()
            .then((v) =>
              stake({
                variables: {
                  publicKey: v,
                  amount: amount.toString(),
                },
              })
            )
            .then(
              () => staked?.actionTxQuery && tx(staked.actionTxQuery.stake!)
            )
            .then(
              (v) =>
                v?.data &&
                fetchStatus({ variables: { txId: v.data.stageTransaction } })
            )
            .catch((e) => {
              console.error(e);
              setLoading(false);
            });
        }}
        onClose={onClose}
        tip={tip}
        isLoading={isLoading}
      >
        {collection.stateQuery.monsterCollectionState && !isLoading && (
          <Migration
            tip={tip}
            collectionState={collection.stateQuery.monsterCollectionState}
            collectionSheet={collection.stateQuery.monsterCollectionSheet}
            onActionTxId={(txId) => {
              setLoading(true);
              trackEvent("Staking/Migration", {
                txId,
                tip,
                level: collection.stateQuery.monsterCollectionState?.level,
              });
              fetchStatus({ variables: { txId } });
            }}
            onClose={onClose}
          />
        )}
      </MonsterCollectionContent>
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);