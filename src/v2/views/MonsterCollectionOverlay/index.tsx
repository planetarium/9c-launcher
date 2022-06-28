import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { MonsterCollectionOverlayBase } from "./base";
import { MonsterCollectionContent } from "./MonsterCollectionContent";
import { OverlayProps } from "src/v2/utils/types";

import { useBalance } from "src/v2/utils/useBalance";
import { useStore } from "src/v2/utils/useStore";
import { placeholder, useTx } from "src/v2/utils/useTx";
import {
  TxStatus,
  useCurrentStakingQuery,
  useLegacyCollectionStateQuery,
  useStakingSheetQuery,
  useTransactionResultLazyQuery,
} from "src/v2/generated/graphql";
import Migration from "./Migration";
import { ipcRenderer } from "electron";
import { useTip } from "src/v2/utils/useTip";

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  const account = useStore("account");
  const { data: sheet } = useStakingSheetQuery();
  const { data: current, refetch: refetchStaking } = useCurrentStakingQuery({
    variables: { address: account.selectedAddress },
    skip: !account.isLogin,
  });
  const {
    data: collection,
    refetch: refetchCollection,
  } = useLegacyCollectionStateQuery({
    variables: { address: account.selectedAddress },
    skip: !account.isLogin,
  });
  const balance = useBalance();
  const tip = useTip();

  const tx = useTx("stake", placeholder);
  const [isLoading, setLoading] = useState(false);
  const [
    fetchStatus,
    { data: txStatus, stopPolling },
  ] = useTransactionResultLazyQuery({
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
          try {
            ipcRenderer.send("mixpanel-track-event", "Staking/AmountChange", {
              amount: amount.toString(),
              previousAmount: current.stateQuery.stakeState?.deposit,
            });
          } catch (e) {
            console.error(e);
          }
          return tx(amount.toString())
            .then(
              (v) =>
                v.data && fetchStatus({ variables: { txId: v.data.stageTxV2 } })
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
              ipcRenderer.send("mixpanel-track-event", "Staking/Migration", {
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
