import { CollectionItemTier } from "../types";

export const getMonsterImageFromTier = (tier: CollectionItemTier): string => {
  const prefix = 'mon_0';
  return `${prefix}${tier}`;
}
