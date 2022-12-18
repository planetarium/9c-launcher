import { ipcRenderer } from "electron";
import { useMemo } from "react";
import { getTotalDepositedGold } from "src/collection/components/common/collectionSheet";
import { RewardCategory } from "src/collection/types";
import {
  useCollectionSheetQuery,
  useCollectionStateByAgentSubscription,
  useCollectionStatusByAgentSubscription,
  useCollectionStatusQueryQuery,
  useStateQueryMonsterCollectionQuery,
} from "src/v2/generated/graphql";
import { useStore } from "../useStore";
import { mapSheetResponseToSheet } from "./internal";

export function useMonsterCollection() {
  const account = useStore("account");
  const commonQuery = {
    variables: {
      address: account.address,
    },
    skip: !account.isLogin,
  };

  const { data: collectionStatusQuery } =
    useCollectionStatusQueryQuery(commonQuery);
  const { data: collectionStatus } =
    useCollectionStatusByAgentSubscription(commonQuery);
  const { data: collectionStateQuery } = useStateQueryMonsterCollectionQuery({
    variables: { agentAddress: account.address },
    skip: !account.isLogin,
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
