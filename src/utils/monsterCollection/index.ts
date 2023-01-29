import { ipcRenderer } from "electron";
import { useMemo } from "react";
import {
  useCollectionSheetQuery,
  useCollectionStateByAgentSubscription,
  useCollectionStatusByAgentSubscription,
  useCollectionStatusQueryQuery,
  useStateQueryMonsterCollectionQuery,
} from "src/generated/graphql";
import {
  RewardCategory,
  CollectionSheetItem,
  CollectionItemTier,
} from "src/interfaces/collection";
import { useStore } from "../useStore";
import { mapSheetResponseToSheet } from "./internal";
import { useLoginSession } from "../useLoginSession";

const getTotalDepositedGold = (
  sheet: CollectionSheetItem[],
  target: CollectionItemTier
) => {
  let gold = 0;
  sheet.forEach((sheetItem) => {
    if (sheetItem.level <= target) gold += sheetItem.requiredGold;
  });
  return gold;
};

export function useMonsterCollection() {
  const { address } = useLoginSession();
  const commonQuery = {
    variables: {
      address,
    },
    skip: !address,
  };

  const { data: collectionStatusQuery } =
    useCollectionStatusQueryQuery(commonQuery);
  const { data: collectionStatus } =
    useCollectionStatusByAgentSubscription(commonQuery);
  const { data: collectionStateQuery } = useStateQueryMonsterCollectionQuery({
    variables: { agentAddress: address },
    skip: !address,
  });
  const { data: collectionState } =
    useCollectionStateByAgentSubscription(commonQuery);

  const level =
    collectionState?.monsterCollectionStateByAgent?.level ??
    collectionStateQuery?.stateQuery?.monsterCollectionState?.level ??
    0;
  const receivedBlockIndex =
    collectionState?.monsterCollectionStateByAgent?.receivedBlockIndex ??
    collectionStateQuery?.stateQuery?.monsterCollectionState
      ?.receivedBlockIndex ??
    0;

  const { data: collectionSheet } = useCollectionSheetQuery({
    skip: level <= 0,
  });

  return {
    currentReward: useMemo(() => {
      const rewardInfos =
        collectionStatus?.monsterCollectionStatusByAgent?.rewardInfos ??
        collectionStatusQuery?.monsterCollectionStatus?.rewardInfos;
      const currentReward = new Map<RewardCategory, number>();

      rewardInfos?.forEach((x) => {
        currentReward.set(x!.itemId, x!.quantity);
      });
      return currentReward;
    }, [collectionStatus, collectionStatusQuery]),
    level,
    receivedBlockIndex,
    depositedGold: useMemo(() => {
      const sheetResponse =
        collectionSheet?.stateQuery.monsterCollectionSheet?.orderedList;
      if (!sheetResponse) return 0;
      return getTotalDepositedGold(
        sheetResponse.map(mapSheetResponseToSheet),
        level
      );
    }, [collectionSheet]),
    claimableBlockIndex: useMemo(
      () =>
        collectionState?.monsterCollectionStateByAgent?.claimableBlockIndex ??
        collectionStateQuery?.stateQuery.monsterCollectionState
          ?.claimableBlockIndex,
      [collectionState, collectionStateQuery]
    ),
    currentTip: collectionStatus?.monsterCollectionStatusByAgent.tipIndex ?? 0,
  };
}

export function openMonsterCollection(address: string) {
  ipcRenderer.invoke("open collection page", address);
}
