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
  useGetTipQuery,
  useLegacyCollectionStateQuery,
  useStakingSheetQuery,
  useTipSubscription,
  useTransactionResultLazyQuery,
} from "src/v2/generated/graphql";
import Migration from "./Migration";

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  const account = useStore("account");
  const { data: sheet } = useStakingSheetQuery();
  const { data: current, refetch } = useCurrentStakingQuery({
    variables: { address: account.selectedAddress },
  });
  const { data: collection } = useLegacyCollectionStateQuery({
    variables: { address: account.selectedAddress },
  });
  const balance = useBalance();
  const { data: tip } = useGetTipQuery({
    pollInterval: 1000,
  });

  const tx = useTx("stake", placeholder);
  const [isLoading, setLoading] = useState(false);
  const [
    fetchStatus,
    { data: txStatus, stopPolling },
  ] = useTransactionResultLazyQuery({
    pollInterval: 1000,
  });

  useEffect(() => {
    if (txStatus?.transaction.transactionResult.txStatus !== TxStatus.Staging) {
      stopPolling?.();
      setLoading(false);
    }
    if (txStatus?.transaction.transactionResult.txStatus === TxStatus.Success)
      refetch();
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
        tip={tip.nodeStatus.tip.index}
        isLoading={isLoading}
      >
        {collection.stateQuery.monsterCollectionState && (
          <Migration
            tip={tip.nodeStatus.tip.index}
            collectionState={collection.stateQuery.monsterCollectionState}
            collectionSheet={collection.stateQuery.monsterCollectionSheet}
            onActionTxId={(txId) => {
              setLoading(true);
              fetchStatus({ variables: { txId } });
            }}
          />
        )}
      </MonsterCollectionContent>
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
