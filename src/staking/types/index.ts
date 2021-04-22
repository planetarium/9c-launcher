export enum RewardCategory {
    HOURGLASS = 400000,
    AP = 500000,
}

export enum StakingItemTier {
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

export enum StakingPhase {
    STAKED,
    LATEST,
    CANDIDATE,
    LOCKED
}

export type Reward = {
  itemId: RewardCategory,
  quantity: number,
}

export type StakingSheetItem = {
  level: StakingItemTier,
  reward: Reward[],
  requiredGold: number,
}
