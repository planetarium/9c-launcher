import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import {
  TxStatus,
  useCurrentStakingQuery,
  useLegacyCollectionStateQuery,
  useStakeLazyQuery,
  useStakingSheetQuery,
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
  const { data: sheet } = useStakingSheetQuery();
  const { data: current, refetch: refetchStaking } = useCurrentStakingQuery({
    variables: { address: loginSession?.address?.toString() },
    skip: !loginSession,
  });
  const { data: collection, refetch: refetchCollection } =
    useLegacyCollectionStateQuery({
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
      refetchStaking();
      refetchCollection();
    }
    if (txStatus.transaction.transactionResult.txStatus !== TxStatus.Staging) {
      stopPolling?.();
      setLoading(false);
    }
  }, [txStatus]);

  if (!sheet || !current || !collection || !tip || !loginSession) return null;

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
