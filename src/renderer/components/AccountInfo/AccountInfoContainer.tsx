import React, { useEffect, useState } from "react";
import { Reward } from "../../../staking/types";
import {
  useGoldAndStakingLevelLazyQuery,
  useNodeStatusSubscriptionSubscription,
  useStagedTxQuery,
  useStakingSheetQuery,
  useStakingStateSubscription,
  useStakingStatusSubscription,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import ClaimStakingRewardContainer from "../ClaimStakingRewardDialog/ClaimStakingRewardContainer";
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
  const [stakedGold, setStakedGold] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [
    goldLevelQuery,
    { data: goldAndLevel, loading, error },
  ] = useGoldAndStakingLevelLazyQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });
  const {
    data: sheet,
    loading: sheetLoading,
    refetch: sheetRefetch,
  } = useStakingSheetQuery();
  const {
    data: stakingStatus,
    loading: statusLoading,
  } = useStakingStatusSubscription();
  const {
    data: stakingState,
    loading: stateLoading,
  } = useStakingStateSubscription();
  const { data: nodeStatus } = useNodeStatusSubscriptionSubscription();
  const { refetch: stagedTxRefetch } = useStagedTxQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });

  useEffect(() => {
    let currentStakedGold = 0;
    setRewards([]);
    sheetRefetch().then((query) => {
      const level = stakingState?.stakingState.level
        ? Number(stakingState?.stakingState.level)
        : Number(goldAndLevel?.stateQuery.agent?.stakingLevel);
      query?.data.stateQuery.stakingSheet?.orderedList?.forEach((x) => {
        if (level >= Number(x?.level)) {
          currentStakedGold += Number(x?.requiredGold);
          x?.rewards.map((x) =>
            setRewards((state) =>
              state.concat({
                itemId: x?.itemId,
                quantity: x?.quantity,
              } as Reward)
            )
          );
        }
      });
      setStakedGold(currentStakedGold);
    });
  }, [goldAndLevel, stakingState]);

  useEffect(() => {
    goldLevelQuery();
  }, [accountStore.isLogin]);

  const handleAcion = async (stakingTx: string) => {
    setOpenDialog(false);
    setClaimLoading(true);
    while (stakingTx) {
      const stagedTx = await stagedTxRefetch();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const tx = stagedTx!.data.nodeStatus.stagedTxIds!.find(
        (x) => x === stakingTx
      );
      if (!tx) break;
    }
    setClaimLoading(false);
  };

  if (accountStore.isLogin && nodeStatus?.nodeStatus?.preloadEnded)
    return (
      <>
        <AccountInfo
          minedBlock={minedBlock}
          onOpenWindow={onOpenWindow}
          canClaimReward={stakingStatus?.stakingStatus.canReceive!}
          goldLabel={
            stakingStatus?.stakingStatus.fungibleAssetValue.quantity
              ? Number(stakingStatus.stakingStatus.fungibleAssetValue.quantity)
              : Number(goldAndLevel?.stateQuery.agent?.gold)
          }
          stakingLabel={stakedGold}
        />
        {stakingStatus?.stakingStatus.canReceive ? (
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
          <ClaimStakingRewardContainer
            rewards={rewards}
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
        onOpenWindow={onOpenWindow}
        canClaimReward={false}
        goldLabel={"loading..."}
        stakingLabel={"loading..."}
      />
    </>
  );
};

export default AccountInfoContainer;
