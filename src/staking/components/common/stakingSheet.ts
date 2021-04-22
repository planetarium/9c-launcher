import { RewardCategory, StakingSheetItem, StakingItemTier } from "../../types";

export const getRewardCategoryList = (): number[] => {
  const result: number[] = [];
  for (let category in RewardCategory) {
    const value = Number(category);
    if(!isNaN(value)) result.push(value);
  }
  return result;
}

export const getExpectedReward = (sheet: StakingSheetItem[], target: StakingItemTier) => {
  const currentReward = new Map<RewardCategory, number>();

  sheet.forEach(sheetItem => {
    if(sheetItem.level <= target) {
      sheetItem.reward.forEach(x => {
        const reward = currentReward.get(x.itemId);
        currentReward.set(x.itemId, reward 
          ? reward + x.quantity 
          : x.quantity);
      });
    }
  });
  return currentReward;
}

export const getTotalStakingGold = (sheet: StakingSheetItem[], target: StakingItemTier) => {
  let gold = 0;
  sheet.forEach(sheetItem => {
    if(sheetItem.level <= target) gold += sheetItem.requiredGold;
  });
  return gold;
}
