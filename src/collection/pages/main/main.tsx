import React, { useEffect, useState } from "react";
import BackgroundImage from "../../common/resources/staking_bg.png";

import CollectionItem from "../../components/CollectionItem/CollectionItem";
import Cart from "../../components/Cart/Cart";
import { Reward, CollectionItemTier, CollectionPhase, CollectionSheetItem } from "../../types";

import "./main.scss";
import ConfirmationDialog from "../../components/RenewDialog/RenewDialog";
import LoadingDialog from "../../components/LoadingDialog/LoadingDialog";
import {
  useCollectMutation,
  useGetTipQuery,
  useMinerAddressQuery,
  useCollectionSheetWithStateLazyQuery,
  useCollectionStatusSubscription,
  useCollectionStatusQueryQuery,
  useCollectionStateSubscription,
  useStateQueryMonsterCollectionQuery,
  MonsterCollectionStatusType,
} from "../../../generated/graphql";
import { CollectionItemModel } from "../../models/collection";
import ExpectedStatusBoard from "../../components/ExpectedStatusBoard/ExpectedStatusBoard";
import CollectionPanel from "../../components/CollectionPanel/CollectionPanel";
import RemainingDisplay from "../../components/RemainingDisplay/RemainingDisplay";
import LoadingPage from "./loading";

const getCollectionPhase = (level: number, collectionLevel: number): CollectionPhase => {
  if (level === collectionLevel + 1) return CollectionPhase.CANDIDATE;
  else if (level > collectionLevel) return CollectionPhase.LOCKED;
  else if (level === collectionLevel) return CollectionPhase.LATEST;
  else return CollectionPhase.COLLECTED;
};

const Main: React.FC = () => {
  const [agentAddress, setAgentAddress] = useState<string>("");
  const [collectionLevel, setCollectionLevel] = useState<number>(0);
  const [cartList, setCart] = useState<CollectionItemModel[]>([]);
  const [tempCartList, setTempCart] = useState<CollectionItemModel[]>([]);
  const [collectionSheet, setCollectionSheet] = useState<CollectionSheetItem[]>([]);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [openLoading, setOpenLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [depositedGold, setDepositedGold] = useState<number>(0);
  const [remainTime, setRemainTime] = useState<number>(0);
  const [currentTier, setCurrentTier] = useState<CollectionItemTier>(0);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [lockup, setLockup] = useState<boolean>(false);
  const [hasRewards, setHasRewards] = useState<boolean>(false);

  const [collectionSheetQuery, {
    loading,
    data: sheetQuery,
    refetch,
  }] = useCollectionSheetWithStateLazyQuery({
    variables: {
      address: agentAddress,
    }
  });
  const { data: minerAddress, loading: minerAddressLoading } = useMinerAddressQuery();
  const [
    collect,
  ] = useCollectMutation();

  const { data: collectionStatus } = useCollectionStatusSubscription();
  const { data: collectionState } = useCollectionStateSubscription();
  const { data: nodeStatus } = useGetTipQuery({
    pollInterval: 1000 * 5
  });
  const { data: collectionStateQuery } = useStateQueryMonsterCollectionQuery({
    variables: {
      agentAddress: agentAddress
    },
    pollInterval: 1000 * 5
  });
  const { data: collectionStatusQuery } = useCollectionStatusQueryQuery();

  useEffect(() => {
    let targetBlock = 0;
    if (collectionState?.monsterCollectionState != null) {
      targetBlock = Number(collectionState?.monsterCollectionState.claimableBlockIndex);
    } else {
      targetBlock = Number(collectionStateQuery?.stateQuery.monsterCollectionState?.claimableBlockIndex);
    }
    const currentTip = nodeStatus?.nodeStatus.tip.index || 0;
    const delta = targetBlock - currentTip;
    setRemainTime(Math.round(delta / 5))
  }, [nodeStatus, collectionState, collectionStateQuery])

  const applyCollectionLevel = (level: number) => {
    setCollectionLevel(level);
    setIsCollecting(level > 0);
    setCurrentTier(level);
  };

  const applyCollectionStatus = (status: MonsterCollectionStatusType | undefined | null) => {
    setLockup(status?.lockup ?? false);
    setHasRewards((status?.rewardInfos?.length ?? 0) > 0);
  }

  useEffect(() => {
    applyCollectionLevel(collectionState?.monsterCollectionState.level ?? 0);
  }, [collectionState]);

  useEffect(() => {
    applyCollectionLevel(collectionStateQuery?.stateQuery.monsterCollectionState?.level ?? 0);
  }, [collectionStateQuery]);

  useEffect(() => {
    applyCollectionStatus(collectionStatus?.monsterCollectionStatus);
  }, [collectionStatus]);

  useEffect(() => {
    applyCollectionStatus(collectionStatusQuery?.monsterCollectionStatus);
  }, [collectionStatusQuery]);

  useEffect(() => {
    if (
      sheetQuery?.stateQuery.monsterCollectionSheet == null ||
      sheetQuery.stateQuery.monsterCollectionSheet.orderedList == null
    )
      return;

    setCart((state) => []);
    setCollectionSheet((state) => []);
    sheetQuery!.stateQuery.monsterCollectionSheet!.orderedList!.map((x) => {
      setCart((state) =>
        state.concat({
          tier: x!.level,
          collectionPhase: getCollectionPhase(
            x!.level,
            collectionLevel
          ),
          value: x!.requiredGold,
        } as CollectionItemModel)
      );
      setCollectionSheet((state) =>
        state.concat({
          level: x?.level,
          requiredGold: x?.requiredGold,
          reward: x?.rewards.map((x) => {
            return {
              quantity: x?.quantity,
              itemId: x?.itemId,
            } as Reward;
          }),
        } as CollectionSheetItem)
      );
    });

    setDepositedGold(0);
    sheetQuery.stateQuery.monsterCollectionSheet.orderedList.forEach((tier) => {
      if (collectionLevel >= tier!.level) {
        setDepositedGold((x) => x + tier!.requiredGold);
      }
    });
  }, [sheetQuery, collectionLevel]);

  useEffect(() => {
    setTempCart(cartList);
  }, [cartList])

  useEffect(() => {
    if (sheetQuery?.stateQuery) refetch();
    else collectionSheetQuery();
  }, [agentAddress]);

  useEffect(() => {
    if (minerAddress != null) {
      setAgentAddress(minerAddress.minerAddress!);
    }
  }, [minerAddress]);

  useEffect(() => {
    if (openLoading) {
      setOpenLoading(false);
      setEdit(false);
    }

    if (collectionLevel === 0) {
      setCart((state) => state.map(x => ({
        tier: x.tier,
        value: x.value,
        collectionPhase: getCollectionPhase(x.tier, 0),
      } as CollectionItemModel)));
      setDepositedGold(0);
    }
  }, [collectionLevel]);

  if (loading || minerAddressLoading) return <LoadingPage />;
  if (minerAddress?.minerAddress == null) {
    // FIXME we should translate this message.
    return <div>you need login first</div>
  }
  if (sheetQuery?.stateQuery.agent == null) {
    // FIXME we should translate this message.
    return <div>you need create avatar first</div>
  }
  if (
    sheetQuery?.stateQuery.monsterCollectionSheet == null ||
    sheetQuery.stateQuery.monsterCollectionSheet.orderedList == null
  )
    return <div>Chain has no monstercollection sheet</div>;
  const addCart = (item: CollectionItemModel) => {
    if (item.collectionPhase != CollectionPhase.CANDIDATE) return;

    setTempCart((state) =>
      state.map((x) =>
        x.tier === item.tier - 1
          ? ({ ...x, collectionPhase: CollectionPhase.COLLECTED } as CollectionItemModel)
          : x
      )
    );
    setTempCart((state) =>
      state.map((x) =>
        x.tier === item.tier
          ? ({ ...x, collectionPhase: CollectionPhase.LATEST } as CollectionItemModel)
          : x
      )
    );
    setTempCart((state) =>
      state.map((x) =>
        x.tier === item.tier + 1
          ? ({ ...x, collectionPhase: CollectionPhase.CANDIDATE } as CollectionItemModel)
          : x
      )
    );
  };

  const removeCart = (item: CollectionItemModel) => {
    if (item.collectionPhase != CollectionPhase.LATEST) return;

    if (hasRewards) {
      alert("There are rewards to be received. Please try again after receiving the reward.");
      return;
    }

    if (lockup && item.tier <= collectionLevel) {
      alert("Locked-up monsters can be removed after about 1 month (201,600 blocks).");
      return;
    }

    setTempCart((state) =>
      state.map((x) =>
        x.tier === item.tier - 1
          ? ({ ...x, collectionPhase: CollectionPhase.LATEST } as CollectionItemModel)
          : x
      )
    );
    setTempCart((state) =>
      state.map((x) =>
        x.tier === item.tier
          ? ({ ...x, collectionPhase: CollectionPhase.CANDIDATE } as CollectionItemModel)
          : x
      )
    );
    setTempCart((state) =>
      state.map((x) =>
        x.tier === item.tier + 1
          ? ({ ...x, collectionPhase: CollectionPhase.LOCKED } as CollectionItemModel)
          : x
      )
    );
  };

  const collectionMutation = async () => {
    const latestCollectionItem = tempCartList.find(
      (x) => x.collectionPhase === CollectionPhase.LATEST
    );
    const collectionResult = await collect({
      variables: { level: latestCollectionItem?.tier ?? 0 },
    });

    return collectionResult.data!.action!.monsterCollect as string;
  };

  const handleSubmit = () => {
    if (hasRewards) {
      alert("There are rewards to be received. Please try again after receiving the reward.");
      return;
    }

    setOpenConfirmation(true);
  };

  const handleEdit = () => {
    if (hasRewards) {
      alert("There are rewards to be received. Please try again after receiving the reward.");
    }
    else {
      setEdit(true);
    }
  }

  const handleCancel = () => {
    setEdit(false)
    setTempCart(cartList);
  }

  const handleConfirmSubmit = async () => {
    setOpenConfirmation(false);
    setOpenLoading(true);

    const collectionTx = await collectionMutation();
    if (!collectionTx) {
      setOpenLoading(false);
      setEdit(false);
      return;
    }
  }

  const handleConfirmCancel = () => {
    setOpenConfirmation(false);
  }

  return (
    <div
      className={"MainContainer"}
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className={"MainBorder"}>
        {edit ? (
          <div className={"MainExpectedStatusBoard"}>
            <ExpectedStatusBoard
              collectionSheet={collectionSheet}
              currentTier={currentTier}
              targetTier={
                tempCartList.find((x) => x.collectionPhase === CollectionPhase.LATEST)?.tier || CollectionItemTier.TIER0
              }
            />
          </div>

        ) : (
          <div className={'MainRemainDisplayPos'}>
            <RemainingDisplay remainMin={remainTime} isCollected={isCollecting} />
          </div>
        )}
        <div className={"CollectionItemList"}>
          {(edit ? tempCartList : cartList).map((x, i) => (
            <CollectionItem item={x} isEdit={edit} key={i} />))}
        </div>
        {edit ? (
          <div className={"MainCartContainer"}>
            <Cart
              cartList={tempCartList}
              totalGold={Number(collectionStateQuery?.stateQuery.agent?.gold ?? 0) + depositedGold}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              onRemove={removeCart}
              onPush={addCart}
              warningMessage={lockup ? "During the lockup period, you can only add monsters." : ""}
            />
          </div>
        ) : (
          <div className={'MainCollectionPanelContainer'}>
            <CollectionPanel
              sheet={collectionSheet}
              tier={currentTier}
              onEdit={handleEdit} />
          </div>
        )}

        <ConfirmationDialog
          open={openConfirmation}
          onSubmit={handleConfirmSubmit}
          onCancel={handleConfirmCancel}
        />

        <LoadingDialog open={openLoading} />
      </div>

    </div>
  );
};

export default Main;
