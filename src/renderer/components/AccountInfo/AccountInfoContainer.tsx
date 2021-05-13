import React, { useEffect, useState } from "react";
import { Reward } from "../../../collection/types";
import {
  useGoldAndCollectionLevelLazyQuery,
  useNodeStatusSubscriptionSubscription,
  useStagedTxQuery,
  useCollectionSheetQuery,
  useCollectionStateSubscription,
  useCollectionStatusSubscription,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import ClaimCollectionRewardContainer from "../ClaimCollectionRewardDialog/ClaimCollectionRewardContainer";
import RewardButton from "../RewardButton/RewardButton";
import AccountInfo from "./AccountInfo";

export type Props = {
  minedBlock: number;
  onReward: (address: string) => void;
  onOpenWindow: () => void;
};

const AccountInfoContainer: React.FC<Props> = (props: Props) => {
  const { minedBlock, onReward, onOpenWindow } = props;
  const { accountStore } = useStores();
  const [depositedGold, setDepositeGold] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [
    goldLevelQuery,
    { data: goldAndLevel, loading, error },
  ] = useGoldAndCollectionLevelLazyQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });
  const {
    refetch: sheetRefetch,
  } = useCollectionSheetQuery();
  const {
    data: collectionStatus,
  } = useCollectionStatusSubscription();
  const {
    data: collectionState,
  } = useCollectionStateSubscription();
  const { data: nodeStatus } = useNodeStatusSubscriptionSubscription();
  const { refetch: stagedTxRefetch } = useStagedTxQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });

  useEffect(() => {
    let currentDepositedGold = 0;
    setRewards([]);
    sheetRefetch().then((query) => {
      const level = collectionState?.monsterCollectionState.level
        ? Number(collectionState?.monsterCollectionState.level)
        : Number(goldAndLevel?.stateQuery.agent?.monsterCollectionLevel);
      query?.data.stateQuery.monsterCollectionSheet?.orderedList?.forEach((x) => {
        if (level >= Number(x?.level)) {
          currentDepositedGold += Number(x?.requiredGold);
          x?.rewards.map((x) =>
            setRewards((state) =>
              state.concat({
                itemId: x?.itemId,
                quantity: x?.quantity,
              } as Reward)
            )
          );
        }
      });
      setDepositeGold(currentDepositedGold);
    });
  }, [goldAndLevel, collectionState]);

  useEffect(() => {
    goldLevelQuery();
  }, [accountStore.isLogin]);

  const handleAcion = async (collectTx: string) => {
    setOpenDialog(false);
    setClaimLoading(true);
    while (collectTx) {
      const stagedTx = await stagedTxRefetch();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const tx = stagedTx!.data.nodeStatus.stagedTxIds!.find(
        (x) => x === collectTx
      );
      if (!tx) break;
    }
    setClaimLoading(false);
  };

  if (accountStore.isLogin && nodeStatus?.nodeStatus?.preloadEnded)
    return (
      <>
        <AccountInfo
          minedBlock={minedBlock}
          onOpenWindow={onOpenWindow}
          canClaimReward={collectionStatus?.monsterCollectionStatus.canReceive!}
          goldLabel={
            collectionStatus?.monsterCollectionStatus.fungibleAssetValue.quantity
              ? Number(collectionStatus.monsterCollectionStatus.fungibleAssetValue.quantity)
              : Number(goldAndLevel?.stateQuery.agent?.gold)
          }
          collectionLabel={depositedGold}
        />
        {collectionStatus?.monsterCollectionStatus.canReceive ? (
          <RewardButton
            loading={claimLoading}
            onClick={() => {
              setOpenDialog(true);
            }}
          />
        ) : (
          <></>
        )}
        {openDialog ? (
          <ClaimCollectionRewardContainer
            rewards={rewards}
            onActionTxId={handleAcion}
            open={openDialog}
          />
        ) : (
          <></>
        )}
      </>
    );
  return (
    <>
      <AccountInfo
        minedBlock={0}
        onOpenWindow={onOpenWindow}
        canClaimReward={false}
        goldLabel={"loading..."}
        collectionLabel={"loading..."}
      />
    </>
  );
};

export default AccountInfoContainer;
