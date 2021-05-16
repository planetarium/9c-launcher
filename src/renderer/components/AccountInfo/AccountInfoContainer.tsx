import React, { useEffect, useState } from "react";
import { getExpectedReward, getTotalDepositedGold } from "../../../collection/components/common/collectionSheet";
import { CollectionSheetItem, Reward, RewardCategory } from "../../../collection/types";
import {
  useGoldAndCollectionLevelLazyQuery,
  useNodeStatusSubscriptionSubscription,
  useStagedTxQuery,
  useCollectionSheetQuery,
  useCollectionStateSubscription,
  useCollectionStatusSubscription,
  useGoldAndCollectionLevelQuery,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import ClaimCollectionRewardContainer from "../ClaimCollectionRewardDialog/ClaimCollectionRewardContainer";
import RewardButton from "../RewardButton/RewardButton";
import AccountInfo from "./AccountInfo";

export type Props = {
  minedBlock: number;
  onReward: (address: string) => void;
  onOpenWindow: () => void;
};

const AccountInfoContainer: React.FC<Props> = (props: Props) => {
  const { minedBlock, onReward, onOpenWindow } = props;
  const { accountStore } = useStores();
  const [depositedGold, setDepositeGold] = useState<number>(0);
  const [currentReward, setCurrentReward] = useState<
    Map<RewardCategory, number>>(new Map<RewardCategory, number>());
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const { data: goldAndLevel, loading, error, startPolling }
   = useGoldAndCollectionLevelQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });
  const {
    refetch: sheetRefetch,
  } = useCollectionSheetQuery();
  const {
    data: collectionStatus,
  } = useCollectionStatusSubscription();
  const {
    data: collectionState,
  } = useCollectionStateSubscription();
  const { data: nodeStatus } = useNodeStatusSubscriptionSubscription();
  const { refetch: stagedTxRefetch } = useStagedTxQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });

  useEffect(() => {
    setCurrentReward(new Map<RewardCategory, number>());

    if (collectionState?.monsterCollectionState.end) {
      setDepositeGold(0);
      return;
    }

    sheetRefetch().then((query) => {
      const level = collectionState?.monsterCollectionState.level
        ? Number(collectionState?.monsterCollectionState.level)
        : Number(goldAndLevel?.stateQuery.agent?.monsterCollectionLevel);
      const sheet = query
        .data
        .stateQuery
        .monsterCollectionSheet
        ?.orderedList
        ?.map(x => { 
          return { 
            level: x?.level, 
            requiredGold: x?.requiredGold, 
            reward: x?.rewards.map(x => { 
              return { 
                itemId: x?.itemId, 
                quantity: x?.quantity 
              } as Reward }) 
            } as CollectionSheetItem 
          });
      if (sheet == null) return;
      setDepositeGold(getTotalDepositedGold(sheet, level));
      setCurrentReward(getExpectedReward(sheet, level));
    });
  }, [goldAndLevel, collectionState]);

  useEffect(() => {
    startPolling(1000 * 3);
  }, [accountStore.isLogin]);

  const handleAcion = async (collectTx: string) => {
    setOpenDialog(false);
    setClaimLoading(true);
    while (collectTx) {
      const stagedTx = await stagedTxRefetch();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const tx = stagedTx!.data.nodeStatus.stagedTxIds!.find(
        (x) => x === collectTx
      );
      if (!tx) break;
    }
    setClaimLoading(false);
  };

  if (accountStore.isLogin && nodeStatus?.nodeStatus?.preloadEnded && goldAndLevel?.stateQuery.agent != null)
    return (
      <>
        <AccountInfo
          minedBlock={minedBlock}
          onOpenWindow={onOpenWindow}
          canClaimReward={collectionStatus?.monsterCollectionStatus.canReceive!}
          goldLabel={
            collectionStatus?.monsterCollectionStatus.fungibleAssetValue.quantity
              ? Number(collectionStatus.monsterCollectionStatus.fungibleAssetValue.quantity)
              : Number(goldAndLevel?.stateQuery.agent?.gold)
          }
          collectionLabel={depositedGold}
        />
        {collectionStatus?.monsterCollectionStatus.canReceive ? (
          <RewardButton
            loading={claimLoading}
            onClick={() => {
              setOpenDialog(true);
            }}
          />
        ) : (
          <></>
        )}
        {openDialog ? (
          <ClaimCollectionRewardContainer
            rewards={[...currentReward].map(x => {return {itemId: x[0], quantity: x[1]} as Reward})}
            onActionTxId={handleAcion}
            open={openDialog}
          />
        ) : (
          <></>
        )}
      </>
    );
  return (
    <>
      <AccountInfo
        minedBlock={0}
        onOpenWindow={() => {}}
        canClaimReward={false}
        goldLabel={"loading..."}
        collectionLabel={"loading..."}
      />
    </>
  );
};

export default AccountInfoContainer;
