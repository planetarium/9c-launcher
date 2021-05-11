import React, { useEffect, useState } from "react";
import { RewardCategory, StakingItemTier, StakingSheetItem } from "../../types";
import { getExpectedReward, getRewardCategoryList, getTotalStakingGold } from "../common/stakingSheet";

export type Props = {
  sheet: StakingSheetItem[]
  tier: StakingItemTier
  onEdit: () => void;
}

const StakingPanel: React.FC<Props> = (props: Props) => {
  const {sheet , tier, onEdit} = props;
  const [currentReward, setCurrentReward] = useState<Map<RewardCategory, number>>(new Map<RewardCategory, number>());

  useEffect(() => {
    setCurrentReward(getExpectedReward(sheet, tier))
  }, [sheet, tier])

  return <div>
    <div>
      {getTotalStakingGold(sheet, tier)}
    </div>
    {
      getRewardCategoryList().map(x => <div>{RewardCategory[x]}/{currentReward.get(x)}</div>)
    }
    <button onClick={(e) => {e.preventDefault(); onEdit()}}>
      Edit
    </button>
  </div>
}

export default StakingPanel;
