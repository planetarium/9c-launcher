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
    }
    if (txStatus.transaction.transactionResult.txStatus !== TxStatus.Staging) {
      stopPolling?.();
      setLoading(false);
    }
  }, [txStatus]);

  if (!latestSheet || !userStaking || !tip || !loginSession) return null;

  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} onDismiss={onClose}>
      <MonsterCollectionContent
        latestSheet={latestSheet}
        current={userStaking}
        currentNCG={balance}
        onStake={(amount) => {
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
            }).then((v) => {
              tx(v.data?.actionTxQuery.stake).then((v) => {
                if (!v.data) throw error;
                fetchStatus({ variables: { txId: v.data.stageTransaction } });
              });
            });
          } catch (e) {
            setLoading(false);
            console.error(`Change Amount Failed : ${e}`);
          }
        }}
        onClose={onClose}
        tip={tip}
        isLoading={isLoading}
      ></MonsterCollectionContent>
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
