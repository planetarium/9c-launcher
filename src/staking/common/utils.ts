import { StakingItemTier } from "../types";

export const getMonsterImageFromTier = (tier: StakingItemTier): string => {
  const prefix = 'mon_0';
  return `${prefix}${tier}`;
}
