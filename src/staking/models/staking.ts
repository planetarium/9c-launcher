import { StakingItemTier, StakingPhase } from "../types"

export type StakingState = {
    level: number,
    startBlockIndex: number,
    receivedBlockIndex: number,
    expiredBlockIndex: number,
    rewardLevel: number,
    isEnd: boolean,
}

export type AgentState = {
    address: string,
    gold: number,
}

export type AvatarState = {
    name: string,
    upadtedAt: number,
}

export type ChainState = {
    tipIndex: number,
}

export type StakingItemModel = {
    tier: StakingItemTier,
    stakingPhase: StakingPhase,
    value: number,
}
