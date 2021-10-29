import { CollectionItemTier, CollectionPhase } from "../types";

export type StakingState = {
  level: number;
  startBlockIndex: number;
  receivedBlockIndex: number;
  expiredBlockIndex: number;
  rewardLevel: number;
  isEnd: boolean;
};

export type AgentState = {
  address: string;
  gold: number;
};

export type AvatarState = {
  name: string;
  upadtedAt: number;
};

export type ChainState = {
  tipIndex: number;
};

export type CollectionItemModel = {
  tier: CollectionItemTier;
  collectionPhase: CollectionPhase;
  value: number;
};
