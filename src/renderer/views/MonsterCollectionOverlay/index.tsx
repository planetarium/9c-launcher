import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import {
  TxStatus,
  useUserStakingQuery,
  useV1CollectionStateQuery,
  useStakeLazyQuery,
  useLatestStakingSheetQuery,
  useTransactionResultLazyQuery,
} from "src/generated/graphql";
import { sleep } from "src/utils";
import { trackEvent } from "src/utils/mixpanel";
import { OverlayProps } from "src/utils/types";
import { useBalance } from "src/utils/useBalance";
import { useLoginSession } from "src/utils/useLoginSession";
import { useTip } from "src/utils/useTip";
import { useTx } from "src/utils/useTx";
import Migration from "./Migration";
import { MonsterCollectionContent } from "./MonsterCollectionContent";
import { MonsterCollectionOverlayBase } from "./base";

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  const loginSession = useLoginSession();
  const { data: latestSheet } = useLatestStakingSheetQuery();
  const { data: userStaking, refetch: refetchUserStaking } =
    useUserStakingQuery({
      variables: { address: loginSession?.address?.toString() },
      skip: !loginSession,
    });
  const { data: V1Collection, refetch: refetchV1Collection } =
    useV1CollectionStateQuery({
      variables: { address: loginSession?.address?.toString() },
      skip: !loginSession,
    });
  const balance = useBalance();
  const tip = useTip();

  const tx = useTx();
  const [stake, { data: staked, loading, error }] = useStakeLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [isLoading, setLoading] = useState(false);
  const [fetchStatus, { data: txStatus, stopPolling }] =
    useTransactionResultLazyQuery({
      pollInterval: 1000,
      fetchPolicy: "no-cache",
    });

  useEffect(() => {
    if (!txStatus) return;
    if (txStatus.transaction.transactionResult.txStatus === TxStatus.Success) {
      refetchUserStaking();
      refetchV1Collection();
    }
    if (txStatus.transaction.transactionResult.txStatus !== TxStatus.Staging) {
      stopPolling?.();
      setLoading(false);
    }
  }, [txStatus]);

  if (!latestSheet || !userStaking || !V1Collection || !tip || !loginSession)
    return null;

  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} onDismiss={onClose}>
      <MonsterCollectionContent
        sheet={latestSheet}
        current={userStaking}
        currentNCG={balance}
        onChangeAmount={(amount) => {
          setLoading(true);
          trackEvent("Staking/AmountChange", {
            amount: amount.toString(),
            previousAmount: userStaking.stateQuery.stakeState?.deposit,
          });
          try {
            stake({
              variables: {
                publicKey: loginSession.publicKey.toHex("uncompressed"),
                amount: amount.toNumber(),
              },
            });
            while (loading) {
              sleep(500);
            }
            if (!staked?.actionTxQuery) throw error;
            return tx(staked.actionTxQuery.stake).then((v) => {
              if (!v.data) throw error;
              fetchStatus({ variables: { txId: v.data.stageTransaction } });
            });
          } catch (e) {
            setLoading(false);
            console.error(`Change Amount Failed : ${e}`);
          }
        }}
        onClose={onClose}
        tip={tip}
        isLoading={isLoading}
      >
        {V1Collection.stateQuery.monsterCollectionState && !isLoading && (
          <Migration
            tip={tip}
            collectionState={V1Collection.stateQuery.monsterCollectionState}
            collectionSheet={V1Collection.stateQuery.monsterCollectionSheet}
            onActionTxId={(txId) => {
              setLoading(true);
              trackEvent("Staking/Migration", {
                txId,
                tip,
                level: V1Collection.stateQuery.monsterCollectionState?.level,
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
