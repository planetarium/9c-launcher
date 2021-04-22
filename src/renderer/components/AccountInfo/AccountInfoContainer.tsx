import React, { useEffect, useState } from "react";
import {
  useGoldAndStakingLevelQuery,
  useStakingSheetQuery,
  useStakingStatusSubscription,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import AccountInfo from "./AccountInfo";

export type Props = {
  onReward: (address: string) => void;
  onOpenWindow: () => void;
};

const AccountInfoContainer: React.FC<Props> = (props: Props) => {
  const { onReward, onOpenWindow } = props;
  const { accountStore } = useStores();
  const [stakedGold, setStakedGold] = useState<number>(0);
  const { data: goldAndLevel, loading, error } = useGoldAndStakingLevelQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });
  const {data: sheet, loading: sheetLoading} = useStakingSheetQuery();
  const { data: stakingStatus, loading: statusLoading } = useStakingStatusSubscription();

  useEffect(() => {
    let currentStakedGold = 0;
    sheet?.stateQuery.stakingSheet?.orderedList?.forEach(x => {
      const level = Number(goldAndLevel?.stateQuery.agent?.stakingLevel);
      if(level >= Number(x?.level)) {
        currentStakedGold += Number(x?.requiredGold)
      }
    });
    setStakedGold(currentStakedGold);
  }, [goldAndLevel, sheet])

  if (loading || sheetLoading || statusLoading)
    return (
      <AccountInfo
        onOpenWindow={onOpenWindow}
        onReward={onReward}
        canClaimReward={false}
        goldLabel={"loading..."}
        stakingLabel={"loading..."}
      />
    );
  return <AccountInfo 
  onOpenWindow={onOpenWindow}
  onReward={onReward}
  canClaimReward={stakingStatus?.stakingStatus.canReceive!}
  goldLabel={Number(goldAndLevel?.stateQuery.agent?.gold)}
  stakingLabel={stakedGold}
  />;
};

export default AccountInfoContainer;
