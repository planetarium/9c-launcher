import React, { useEffect, useState } from "react";
import {
  Reward,
  RewardCategory,
  CollectionItemTier,
  CollectionSheetItem,
} from "../../types";
import {
  getExpectedReward,
  getRewardCategoryList,
  getTotalDepositedGold,
} from "../common/collectionSheet";
import RewardItem from "./RewardItem/RewardItem";

import "./ExpectedStatusBoard.scss";


export type Props = {
  collectionSheet: CollectionSheetItem[];
  currentTier: CollectionItemTier;
  targetTier: CollectionItemTier;
};

const ExpectedStatusBoard: React.FC<Props> = (props: Props) => {
  const { collectionSheet, currentTier, targetTier } = props;
  const [currentReward, setCurrentReward] = useState<
    Map<RewardCategory, number>
  >(new Map<RewardCategory, number>());
  const [targetReward, setTargetReward] = useState<Map<RewardCategory, number>>(
    new Map<RewardCategory, number>()
  );
  const [depositedGold, setDepositedGold] = useState<number>(0);

  useEffect(() => {
    setCurrentReward(getExpectedReward(collectionSheet, currentTier));
  }, [currentTier, collectionSheet]);

  useEffect(() => {
    setTargetReward(getExpectedReward(collectionSheet, targetTier));
    setDepositedGold(getTotalDepositedGold(collectionSheet, targetTier));
  }, [targetTier, collectionSheet]);

  return (
    <div className={"ExpectedStatusBoardContainer"}>
      <div className={"CurrentStakedGoldContainer"}>
        <div>MY COLLECTION</div>
        <RewardItem left={depositedGold} right={depositedGold} item={"GOLD"} />
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
