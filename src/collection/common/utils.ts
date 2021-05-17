import { CollectionItemTier } from "../types";

export const getMonsterImageFromTier = (tier: CollectionItemTier): string => {
  const prefix = 'mon_0';
  return `${prefix}${tier}`;
}

export const getCartMonsterImageFromTier = (tier: CollectionItemTier): string => {
  const prefix = 'UI_staking_slot_monster_0';
  return `${prefix}${tier}`;
}
