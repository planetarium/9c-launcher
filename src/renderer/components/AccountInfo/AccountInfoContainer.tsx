import React, { useEffect, useMemo, useState } from "react";
import { getRemain } from "../../../collection/common/utils";
import { getTotalDepositedGold } from "../../../collection/components/common/collectionSheet";
import {
  CollectionSheetItem,
  Reward,
  RewardCategory,
} from "../../../collection/types";
import {
  useNodeStatusSubscriptionSubscription,
  useCollectionSheetQuery,
  useStateQueryMonsterCollectionQuery,
  useCollectionStatusQueryQuery,
  useGetAvatarAddressLazyQuery,
  useCollectionStateByAgentSubscription,
  useCollectionStatusByAgentSubscription,
  MonsterCollectionRewardInfoType,
  useGetNcgBalanceQuery,
  useBalanceByAgentSubscription,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import ClaimCollectionRewardContainer from "../ClaimCollectionRewardDialog/ClaimCollectionRewardContainer";
import RewardButton from "../RewardButton/RewardButton";
import AccountInfo from "./AccountInfo";
import { variables } from "electron-log";

export type Props = {
  onReward: (address: string) => void;
  onOpenWindow: () => void;
};

const AccountInfoContainer: React.FC<Props> = (props: Props) => {
  const { onOpenWindow } = props;
  const { accountStore } = useStores();
  const [depositedGold, setDepositeGold] = useState<number>(0);
  const [remainMin, setRemainMin] = useState<number>(0);
  const [currentReward, setCurrentReward] = useState<
    Map<RewardCategory, number>
  >(new Map<RewardCategory, number>());
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [collectionLevel, setCollectionLevel] = useState<number>(0);
  const [receivedBlockIndex, setReceivedBlockIndex] = useState<number>(0);
  const [tip, setTip] = useState<number>(0);
  const [
    avatarAddressQueryLazy,
    { loading: avatarLoading, data: avatars, refetch: avatarRefetch },
  ] = useGetAvatarAddressLazyQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });
  const { refetch: sheetRefetch } = useCollectionSheetQuery();
  const { data: collectionStatus } = useCollectionStatusByAgentSubscription({
    variables: {
      address: accountStore.selectedAddress,
    },
    skip: !accountStore.isLogin,
  });
  const { data: collectionState } = useCollectionStateByAgentSubscription({
    variables: {
      address: accountStore.selectedAddress,
    },
    skip: !accountStore.isLogin,
  });
  const { data: nodeStatus } = useNodeStatusSubscriptionSubscription();
  const { data: collectionStateQuery } = useStateQueryMonsterCollectionQuery({
    variables: {
      agentAddress: accountStore.selectedAddress,
    },
    skip: !accountStore.isLogin,
  });
  const { data: collectionStatusQuery } = useCollectionStatusQueryQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
    skip: !accountStore.isLogin,
  });
  const { data: ncgBalanceQuery } = useGetNcgBalanceQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
    skip: !accountStore.isLogin,
  });
  const { data: balance } = useBalanceByAgentSubscription({
    variables: {
      address: accountStore.selectedAddress,
    },
    skip: !accountStore.isLogin,
  });

  useEffect(() => {
    setCurrentReward(new Map<RewardCategory, number>());
    const rewardInfos =
      collectionStatus?.monsterCollectionStatusByAgent?.rewardInfos ??
      collectionStatusQuery?.monsterCollectionStatus?.rewardInfos;

    const currentReward = new Map<RewardCategory, number>();

    rewardInfos?.forEach((x) => {
      currentReward.set(x!.itemId, x!.quantity);
    });
    setCurrentReward(currentReward);
  }, [collectionStatus, collectionStatusQuery]);

  useEffect(() => {
    setIsCollecting(collectionLevel > 0);
    if (collectionLevel === 0) {
      setDepositeGold(0);
      return;
    }

    sheetRefetch().then((query) => {
      const sheet =
        query.data.stateQuery.monsterCollectionSheet?.orderedList?.map((x) => {
          return {
            level: x?.level,
            requiredGold: x?.requiredGold,
            reward: x?.rewards.map((x) => {
              return {
                itemId: x?.itemId,
                quantity: x?.quantity,
              } as Reward;
            }),
          } as CollectionSheetItem;
        });
      if (sheet == null) return;
      setDepositeGold(getTotalDepositedGold(sheet, collectionLevel));
    });
  }, [collectionLevel]);

  useEffect(() => {
    setCollectionLevel(
      Number(collectionState?.monsterCollectionStateByAgent?.level ?? 0)
    );
    setReceivedBlockIndex(
      collectionState?.monsterCollectionStateByAgent?.receivedBlockIndex ?? 0
    );
  }, [collectionState]);

  useEffect(() => {
    setCollectionLevel(
      Number(
        collectionStateQuery?.stateQuery.monsterCollectionState?.level ?? 0
      )
    );
    setReceivedBlockIndex(
      collectionStateQuery?.stateQuery.monsterCollectionState
        ?.receivedBlockIndex ?? 0
    );
  }, [collectionStateQuery]);

  useEffect(() => {
    setClaimLoading(false);
  }, [receivedBlockIndex]);

  const applyCanClaim = (
    rewardInfos: (MonsterCollectionRewardInfoType | null)[] | null | undefined
  ) => {
    setCanClaim(rewardInfos != undefined && rewardInfos?.length > 0);
  };

  useEffect(() => {
    applyCanClaim(
      collectionStatus?.monsterCollectionStatusByAgent?.rewardInfos
    );
    let targetBlock = 0;
    if (collectionState?.monsterCollectionStateByAgent != null) {
      targetBlock = Number(
        collectionState?.monsterCollectionStateByAgent.claimableBlockIndex
      );
    } else {
      targetBlock = Number(
        collectionStateQuery?.stateQuery.monsterCollectionState
          ?.claimableBlockIndex
      );
    }
    const currentTip =
      collectionStatus?.monsterCollectionStatusByAgent.tipIndex || 0;
    setTip(currentTip);
    const delta = targetBlock - currentTip;
    setRemainMin(Math.round(delta / 5));
  }, [collectionStatus]);

  useEffect(() => {
    applyCanClaim(collectionStatusQuery?.monsterCollectionStatus?.rewardInfos);
  }, [collectionStatusQuery]);

  const handleAcion = () => {
    setOpenDialog(false);
    setClaimLoading(true);
  };

  const gold = useMemo(
    () => Number(balance?.balanceByAgent ?? ncgBalanceQuery?.goldBalance) ?? 0,
    [balance, ncgBalanceQuery]
  );

  if (accountStore.isLogin && nodeStatus?.nodeStatus?.preloadEnded) {
    const mcStatus = collectionStatus?.monsterCollectionStatusByAgent;
    return (
      <>
        <AccountInfo
          onOpenWindow={canClaim ? () => {} : onOpenWindow}
          canClaimReward={
            mcStatus?.rewardInfos != null && mcStatus.rewardInfos.length > 0
          }
          goldLabel={gold}
          collectionLabel={depositedGold}
          remainText={getRemain(remainMin)}
          isCollecting={isCollecting}
        />
        {canClaim ? (
          <div className={"AccountContainerRewardButton"}>
            <RewardButton
              loading={claimLoading}
              onClick={() => {
                avatarAddressQueryLazy();
                setOpenDialog(true);
              }}
            />
          </div>
        ) : (
          <></>
        )}
        {openDialog && avatars ? (
          <ClaimCollectionRewardContainer
            avatarAddressQuery={avatars}
            tip={tip}
            rewards={[...currentReward].map(
              (x) => ({ itemId: x[0], quantity: x[1] } as Reward)
            )}
            onActionTxId={handleAcion}
            open={openDialog}
            agentAddress={accountStore.selectedAddress}
          />
        ) : (
          <></>
        )}
      </>
    );
  }
  return (
    <>
      <AccountInfo
        onOpenWindow={() => {}}
        canClaimReward={false}
        goldLabel={"loading..."}
        collectionLabel={"loading..."}
        remainText={""}
        isCollecting={false}
      />
    </>
  );
};

export default AccountInfoContainer;
