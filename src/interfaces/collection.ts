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
