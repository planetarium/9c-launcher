import React, { useEffect, useState } from "react";
import BackgroundImage from "../../common/resources/staking_bg.png";

import CollectionItem from "../../components/CollectionItem/CollectionItem";
import Cart from "../../components/Cart/Cart";
import { Reward, CollectionItemTier, CollectionPhase, CollectionSheetItem } from "../../types";

import "./main.scss";
import ConfirmationDialog from "../../components/ConfirmationDialog/Dialog";
import {
  useCancelCollectionMutation,
  useCollectMutation,
  useGetTipQuery,
  useStagedTxQuery,
  useMinerAddressQuery,
  useCollectionSheetWithStateLazyQuery,
  useCollectionStatusSubscription,
  useCollectionStateSubscription,
  useStateQueryMonsterCollectionQuery,
  useCollectionStatusQueryQuery,
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
  const [latestTxId, setLatestTxId] = useState<string>("");
  const [cartList, setCart] = useState<CollectionItemModel[]>([]);
  const [tempCartList, setTempCart] = useState<CollectionItemModel[]>([]);
  const [collectionSheet, setCollectionSheet] = useState<CollectionSheetItem[]>([]);
  const [dialog, setDialog] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [depositedGold, setDepositedGold] = useState<number>(0);
  const [remainTime, setRemainTime] = useState<number>(0);
  const [currentTier, setCurrentTier] = useState<CollectionItemTier>(0);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);

  const [collectionSheetQuery, {
    loading,
    error,
    data,
    refetch,
  }] = useCollectionSheetWithStateLazyQuery({
    variables: {
      address: agentAddress,
    },
  });
  const { refetch: stagedTxRefetch } = useStagedTxQuery({
    variables: {
      address: agentAddress,
    },
  });
  const { data: minerAddress, loading: minerAddressLoading } = useMinerAddressQuery();
  const [
    collect,
  ] = useCollectMutation();
  const [
    cancelCollection,
  ] = useCancelCollectionMutation();

  const { data: collectionStatus } = useCollectionStatusSubscription();
  const { data: collectionState } = useCollectionStateSubscription();
  const { data: nodeStatus } = useGetTipQuery({
    pollInterval: 1000 * 5
  });
  const { data: collectionStateQuery } = useStateQueryMonsterCollectionQuery({
    variables: {
      agentAddress: agentAddress
    }
  });

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

  useEffect(() => {
    if (
      data?.stateQuery.monsterCollectionSheet == null ||
      data.stateQuery.monsterCollectionSheet.orderedList == null
    )
      return;
    setCart((state) => []);
    setCollectionSheet((state) => []);
    data!.stateQuery.monsterCollectionSheet!.orderedList!.map((x) => {
      setCart((state) =>
        state.concat({
          tier: x!.level,
          collectionPhase: getCollectionPhase(
            x!.level,
            data!.stateQuery.agent!.monsterCollectionLevel
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
  }, [data, loading]);

  useEffect(() => {
    setTempCart(cartList);
  }, [cartList])

  useEffect(() => {
    if (
      data?.stateQuery.monsterCollectionSheet == null ||
      data.stateQuery.monsterCollectionSheet.orderedList == null
    )
      return;
    if (data?.stateQuery.agent == null) return;
    setDepositedGold(0);
    data.stateQuery.monsterCollectionSheet.orderedList.forEach((tier) => {
      if (data.stateQuery.agent!.monsterCollectionLevel >= tier!.level) {
        setDepositedGold((x) => x + tier!.requiredGold);
      }
    });
  }, [data, loading]);

  useEffect(() => {
    if (data?.stateQuery) refetch();
    else collectionSheetQuery();
  }, [agentAddress]);

  useEffect(() => {
    if (minerAddress != null) {
      setAgentAddress(minerAddress.minerAddress!);
    }
  }, [minerAddress]);

  useEffect(() => {
    if (collectionState?.monsterCollectionState.end) {
      setCart((state) => state.map(x => {
        return {
          tier: x.tier,
          value: x.value,
          collectionPhase: getCollectionPhase(x.tier, 0),
        } as CollectionItemModel
      }));
      setDepositedGold(0);
    }
  }, [collectionState]);

  useEffect(() => {
    if (collectionState?.monsterCollectionState.level === data?.stateQuery.agent?.monsterCollectionLevel) {
      setDialog(false);
      setEdit(false);
    } else {
      if (latestTxId === "") {
        //FIXME: if failed, need action here
      }
    }
  }, [collectionState, data])

  useEffect(() => {
    if(collectionState?.monsterCollectionState.end) {
      setCurrentTier(0);
    } else {
      setCurrentTier(collectionState?.monsterCollectionState.level 
        ? collectionState.monsterCollectionState.level 
        : data?.stateQuery.agent?.monsterCollectionLevel);
    }
  }, [collectionState, data])

  useEffect(() => {
    if(collectionState?.monsterCollectionState.end) {
      setIsCollecting(false);
      return;
    }

    if(collectionState?.monsterCollectionState.level) {
      setIsCollecting(collectionState.monsterCollectionState.level > 0)
    } else {
      setIsCollecting(collectionStateQuery?.stateQuery.monsterCollectionState?.level > 0)
    }
  }, [collectionState, collectionStateQuery])

  if (loading || minerAddressLoading) return <LoadingPage/>;
  if(minerAddress?.minerAddress == null) {
    // FIXME we should translate this message.
    return <div>you need login first</div>
  }
  if (data?.stateQuery.agent == null) {
    // FIXME we should translate this message.
    return <div>you need create avatar first</div>
  }
  if (
    data?.stateQuery.monsterCollectionSheet == null ||
    data.stateQuery.monsterCollectionSheet.orderedList == null
  )
    return <div>Chain has no monstercollection sheet</div>;
  if (error) return <div><p>Error: </p>{JSON.stringify(error)}</div>;
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
    if (item.tier === CollectionItemTier.TIER1) return;

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

    if (!latestCollectionItem) return;

    if (data.stateQuery.agent!.monsterCollectionLevel < latestCollectionItem.tier) {
      const collectionResult = await collect({
        variables: { level: latestCollectionItem.tier },
      });
      return collectionResult.data!.action!.monsterCollect as string;
    } else if (data.stateQuery.agent!.monsterCollectionLevel > latestCollectionItem.tier) {
      const collectionResult = await cancelCollection({
        variables: { level: latestCollectionItem.tier },
      });
      return collectionResult.data!.action!.cancelMonsterCollect as string;
    } else {
      return;
    }
  };

  const handleSubmit = async () => {

    // We don't care about removing exist monster because we've blocked editting on e8423105b0b5abbcfd12279443f1a5cc774a72f2
    // FIXME should adjust this logic after allowing editting.
    if (tempCartList[0].collectionPhase === CollectionPhase.CANDIDATE) {
      alert("Please select at least 1 monster.");
      return;
    }

    setDialog(true);
    const collectionTx = await collectionMutation();
    if (!collectionTx) {
      setDialog(false);
      setEdit(false);
      return;
    }

    setLatestTxId(collectionTx);

    while (collectionTx) {
      const stagedTx = await stagedTxRefetch();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const tx = stagedTx!.data.nodeStatus.stagedTxIds!.find(
        (x) => x === collectionTx
      );
      if (!tx) break;
    }
    await refetch();
    setLatestTxId("");
  };

  const handleEdit = () => {
    // FIXME Block collection editing until collection design changes.
    if (isCollecting) {
      alert("Once the collection is saved, it can be modified after 1 month.");
    } else {
      setEdit(true);
    }
  }

  const handleCancel = () => {
    setEdit(false)
    setTempCart(cartList);
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
              currentTier={data.stateQuery.agent?.monsterCollectionLevel}
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
              totalGold={Number(collectionStatus?.monsterCollectionStatus.fungibleAssetValue.quantity || data.stateQuery.agent?.gold) + depositedGold}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              onRemove={removeCart}
              onPush={addCart}
            />
          </div>
        ) : (
          <div className={'MainCollectionPanelContainer'}>
            <CollectionPanel 
            sheet={collectionSheet} 
            tier={currentTier} 
            onEdit={handleEdit}  />
          </div>
        )}


        <ConfirmationDialog open={dialog} />
      </div>

    </div>
  );
};

export default Main;
