import React, { useEffect, useState } from "react";
import { getRemain } from "../../../collection/common/utils";
import { getExpectedReward, getTotalDepositedGold } from "../../../collection/components/common/collectionSheet";
import { CollectionSheetItem, Reward, RewardCategory } from "../../../collection/types";
import {
  useNodeStatusSubscriptionSubscription,
  useStagedTxQuery,
  useCollectionSheetQuery,
  useCollectionStateSubscription,
  useCollectionStatusSubscription,
  useGoldAndCollectionLevelQuery,
  useStateQueryMonsterCollectionQuery,
  useGetTipQuery,
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
  const [remainMin, setRemainMin] = useState<number>(0);
  const [currentReward, setCurrentReward] = useState<
    Map<RewardCategory, number>>(new Map<RewardCategory, number>());
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const { data: goldAndLevel, refetch: goldAndLevelRefetch, stopPolling }
   = useGoldAndCollectionLevelQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
    pollInterval: 1000 * 3
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
  const { data: queryMonsterCollectionState } = useStateQueryMonsterCollectionQuery({
    variables: {
      agentAddress: accountStore.selectedAddress
    }
  });

const { data: tip } = useGetTipQuery({
  pollInterval: 1000 * 3
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
    let targetBlock = 0;
    if(collectionState?.monsterCollectionState != null) {
      targetBlock = Number(collectionState?.monsterCollectionState.claimableBlockIndex);
    } else {
      targetBlock = Number(queryMonsterCollectionState?.stateQuery.monsterCollectionState?.claimableBlockIndex);
    }
      const currentTip = tip?.nodeStatus.tip.index || 0;
      const delta = targetBlock - currentTip;
      setRemainMin(Math.round(delta / 5));
  }, [queryMonsterCollectionState, collectionState, tip]);

  useEffect(() => {
    if(goldAndLevel?.stateQuery.agent != null) stopPolling();
  },[goldAndLevel])

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

  if (accountStore.isLogin 
      && nodeStatus?.nodeStatus?.preloadEnded 
      && goldAndLevel?.stateQuery.agent != null 
      && accountStore.isMiningConfigEnded)
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
          remainText={getRemain(remainMin)}
          isCollecting={
            collectionState?.monsterCollectionState.level > 0
            || goldAndLevel.stateQuery.agent?.monsterCollectionLevel > 0
          }
        />
        {collectionStatus?.monsterCollectionStatus.canReceive ? (
          <div className={'AccountContainerRewardButton'}>
          <RewardButton
            loading={claimLoading}
            onClick={() => {
              setOpenDialog(true);
            }}
          />
          </div>

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
        remainText={''}
        isCollecting={false}
      />
    </>
  );
};

export default AccountInfoContainer;
