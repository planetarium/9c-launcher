import React, { useEffect, useState } from "react";
import {
  Reward,
  RewardCategory,
  StakingItemTier,
  StakingSheetItem,
} from "../../types";
import {
  getExpectedReward,
  getRewardCategoryList,
  getTotalStakingGold,
} from "../common/stakingSheet";
import RewardItem from "./RewardItem/RewardItem";

import "./ExpectedStatusBoard.scss";


export type Props = {
  stakingSheet: StakingSheetItem[];
  currentTier: StakingItemTier;
  targetTier: StakingItemTier;
};

const ExpectedStatusBoard: React.FC<Props> = (props: Props) => {
  const { stakingSheet, currentTier, targetTier } = props;
  const [currentReward, setCurrentReward] = useState<
    Map<RewardCategory, number>
  >(new Map<RewardCategory, number>());
  const [targetReward, setTargetReward] = useState<Map<RewardCategory, number>>(
    new Map<RewardCategory, number>()
  );
  const [stakingGold, setStakingGold] = useState<number>(0);

  useEffect(() => {
    setCurrentReward(getExpectedReward(stakingSheet, currentTier));
  }, [currentTier, stakingSheet]);

  useEffect(() => {
    setTargetReward(getExpectedReward(stakingSheet, targetTier));
    setStakingGold(getTotalStakingGold(stakingSheet, targetTier));
  }, [targetTier, stakingSheet]);

  return (
    <div className={"ExpectedStatusBoardContainer"}>
      <div className={"CurrentStakedGoldContainer"}>
        <div>MY STAKING</div>
        <RewardItem left={stakingGold} right={stakingGold} item={"GOLD"} />
      </div>

      <div className={"CurrentExpectedRewardContainer"}>
        <div>Rewards</div>
        <div>
          {getRewardCategoryList().map((x) => (
            <RewardItem
              left={currentReward.get(x) || 0}
              right={targetReward.get(x) || 0}
              item={x}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpectedStatusBoard;
