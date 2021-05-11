import React, { useEffect, useState } from "react";
import {
  useGoldAndStakingLevelLazyQuery,
  useStakingSheetQuery,
  useStakingStatusSubscription,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
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
  const [goldLevelQuery, { data: goldAndLevel, loading, error }] = useGoldAndStakingLevelLazyQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });
  const {data: sheet, loading: sheetLoading} = useStakingSheetQuery();
  const { data: stakingStatus, loading: statusLoading } = useStakingStatusSubscription();

  useEffect(() => {
    let currentStakedGold = 0;
    const level = Number(goldAndLevel?.stateQuery.agent?.stakingLevel);
    sheet?.stateQuery.stakingSheet?.orderedList?.forEach(x => {
      console.log(`currentLevel: ${x?.level}`)
      console.log(`targetLevel: ${level}`)
      if(level >= Number(x?.level)) {
        currentStakedGold += Number(x?.requiredGold)
      }
    });
    setStakedGold(currentStakedGold);
    console.log(`gold: ${JSON.stringify(goldAndLevel)}`);
  }, [goldAndLevel, sheet])

  console.log(`stakedGold: ${stakedGold}`)

  useEffect(() => {
    goldLevelQuery();
  }, [accountStore.isLogin]) 

  if (!accountStore.isLogin)
    return (
      <AccountInfo
        minedBlock={0}
        onOpenWindow={onOpenWindow}
        onReward={onReward}
        canClaimReward={false}
        goldLabel={"loading..."}
        stakingLabel={"loading..."}
      />
    );
  return <AccountInfo 
        minedBlock={minedBlock}
  onOpenWindow={onOpenWindow}
  onReward={onReward}
  canClaimReward={stakingStatus?.stakingStatus.canReceive!}
  goldLabel={stakingStatus?.stakingStatus.fungibleAssetValue.quantity 
    ? Number(stakingStatus.stakingStatus.fungibleAssetValue.quantity)
    : Number(goldAndLevel?.stateQuery.agent?.gold)}
  stakingLabel={stakedGold}
  />;
};

export default AccountInfoContainer;
