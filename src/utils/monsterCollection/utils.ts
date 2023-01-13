export enum RewardCategory {
  HOURGLASS = 400000,
  AP = 500000,
}

export enum CollectionItemTier {
  TIER0 = 0,
  TIER1 = 1,
  TIER2 = 2,
  TIER3 = 3,
  TIER4 = 4,
  TIER5 = 5,
  TIER6 = 6,
  TIER7 = 7,
  TIER8 = 8,
}

export enum CollectionPhase {
  COLLECTED,
  LATEST,
  CANDIDATE,
  LOCKED,
}

export type Reward = {
  itemId: RewardCategory;
  quantity: number;
};

export type CollectionSheetItem = {
  level: CollectionItemTier;
  reward: Reward[];
  requiredGold: number;
};

export const getMonsterImageFromTier = (tier: CollectionItemTier): string => {
  const prefix = "mon_0";
  return `${prefix}${tier}`;
};

export const getCartMonsterImageFromTier = (
  tier: CollectionItemTier
): string => {
  const prefix = "UI_staking_slot_monster_0";
  return `${prefix}${tier}`;
};

export const getRemain = (remainMin: number) => {
  const hour = remainMin / 60;

  const days = hour / 24;
  if (days >= 1) return `${Math.round(days)} days`;

  if (hour >= 1) return `${Math.round(hour)} hours`;

  return `less than an hour`;
};

export const getRewardCategoryList = (): number[] => {
  const result: number[] = [];
  for (const category in RewardCategory) {
    const value = Number(category);
    if (!isNaN(value)) result.push(value);
  }
  return result;
};

export const getExpectedReward = (
  sheet: CollectionSheetItem[],
  target: CollectionItemTier
) => {
  const currentReward = new Map<RewardCategory, number>();
  const cell = sheet.find((sheetItem) => sheetItem.level === target);
  cell?.reward.forEach((x) => {
    currentReward.set(x.itemId, x.quantity);
  });

  return currentReward;
};

export const getTotalDepositedGold = (
  sheet: CollectionSheetItem[],
  target: CollectionItemTier
) => {
  let gold = 0;
  sheet.forEach((sheetItem) => {
    if (sheetItem.level <= target) gold += sheetItem.requiredGold;
  });
  return gold;
};
