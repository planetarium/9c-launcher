import { CollectionItemTier } from "../types";

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
