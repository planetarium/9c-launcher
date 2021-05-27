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
  useCollectionStatusQueryQuery,
  useGetAvatarAddressQuery,
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
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);
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
  const { data: collectionStateQuery } = useStateQueryMonsterCollectionQuery({
    variables: {
      agentAddress: accountStore.selectedAddress
    }
  });
  const {
    data: collectionStatusQuery,
  } = useCollectionStatusQueryQuery();

  const { data: tip } = useGetTipQuery({
    pollInterval: 1000 * 3
  });

  const {data: avatarAddressQuery} = useGetAvatarAddressQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
    pollInterval: 1000 * 2
  });

  useEffect(() => {
    setCurrentReward(new Map<RewardCategory, number>());
    const rewardInfos = collectionStatus?.monsterCollectionStatus.rewardInfos 
      ?? collectionStatusQuery?.monsterCollectionStatus?.rewardInfos;

    const currentReward = new Map<RewardCategory, number>();

    rewardInfos?.forEach(x => {
      currentReward.set(x!.itemId, x!.quantity)
    });
    setCurrentReward(currentReward);
  }, [collectionStatus, collectionStatusQuery])

  useEffect(() => {
    if (collectionState?.monsterCollectionState.end) {
      setDepositeGold(0);
      return;
    }

    sheetRefetch().then((query) => {
      const level = collectionState?.monsterCollectionState.level
        ? Number(collectionState?.monsterCollectionState.level)
        : Number(collectionStateQuery?.stateQuery.monsterCollectionState?.level);
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
    });
  }, [collectionState, collectionStateQuery]);

  useEffect(() => {
    let targetBlock = 0;
    if(collectionState?.monsterCollectionState != null) {
      targetBlock = Number(collectionState?.monsterCollectionState.claimableBlockIndex);
    } else {
      targetBlock = Number(collectionStateQuery?.stateQuery.monsterCollectionState?.claimableBlockIndex);
    }
      const currentTip = tip?.nodeStatus.tip.index || 0;
      const delta = targetBlock - currentTip;
      setRemainMin(Math.round(delta / 5));
  }, [collectionStateQuery, collectionState, tip]);

  useEffect(() => {
    if(goldAndLevel?.stateQuery.agent != null) stopPolling();
  },[goldAndLevel])

  useEffect(() => {
    if(collectionState?.monsterCollectionState.level) {
      setIsCollecting(collectionState.monsterCollectionState.level > 0)
    } else {
      setIsCollecting(collectionStateQuery?.stateQuery.monsterCollectionState?.level > 0)
    }
  }, [collectionState, collectionStateQuery])

  useEffect(() => {
    if(collectionStatus?.monsterCollectionStatus.canReceive) {
      setCanClaim(collectionStatus.monsterCollectionStatus.canReceive)
    } else {
      collectionStatusQuery?.monsterCollectionStatus?.canReceive
      ? setCanClaim(true)
      : setCanClaim(false)
    }
  }, [collectionStatus, collectionStatusQuery])

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
      && avatarAddressQuery != null
      && accountStore.isMiningConfigEnded)
    return (
      <>
        <AccountInfo
          minedBlock={minedBlock}
          onOpenWindow={
            canClaim
              ? ()=> {} 
              : onOpenWindow}
          canClaimReward={collectionStatus?.monsterCollectionStatus.canReceive!}
          goldLabel={
            collectionStatus?.monsterCollectionStatus.fungibleAssetValue.quantity
              ? Number(collectionStatus.monsterCollectionStatus.fungibleAssetValue.quantity)
              : Number(goldAndLevel?.stateQuery.agent?.gold)
          }
          collectionLabel={depositedGold}
          remainText={getRemain(remainMin)}
          isCollecting={isCollecting}
        />
        {
          canClaim
          ? (
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
            avatarAddressQuery={avatarAddressQuery}
            tip={tip?.nodeStatus.tip.index || 0}
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
