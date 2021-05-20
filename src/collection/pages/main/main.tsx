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
  const { data: minerAddress } = useMinerAddressQuery();
  const [
    collect,
  ] = useCollectMutation();
  const [
    cancelCollection,
  ] = useCancelCollectionMutation();

  const {data: collectionStatus} = useCollectionStatusSubscription();
  const {data: collectionState} = useCollectionStateSubscription();
  const {data: nodeStatus} = useGetTipQuery({
    pollInterval: 1000 * 5
  });

  useEffect(() => {
    const claimableBlockIndex = Number(collectionState?.monsterCollectionState.claimableBlockIndex || 0);
    const tipIndex = Number(nodeStatus?.nodeStatus.tip.index || 0)
    const delta = claimableBlockIndex - tipIndex;
    if(delta <= 0) return;
    
    setRemainTime(Math.round(delta / 5));
  }, [nodeStatus, collectionState])

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
    if(data?.stateQuery) refetch();
    else collectionSheetQuery();
  }, [agentAddress]);

  useEffect(() => {
    if (minerAddress != null) {
      setAgentAddress(minerAddress.minerAddress!);
    }
  }, [minerAddress]);

  useEffect(() => {
    if(collectionState?.monsterCollectionState.end) {
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
    if(collectionState?.monsterCollectionState.level === data?.stateQuery.agent?.monsterCollectionLevel) {
      setDialog(false);
      setEdit(false);
    } else {
      if(latestTxId === "") {
        //FIXME: if failed, need action here
      }
    }
  }, [collectionState, data])

  if (loading) return <LoadingPage/>;
  if (error) return <p>error</p>;
  if(data?.stateQuery.agent == null) {
    <div>you need create avatar first</div>
  }
  if (
    data?.stateQuery.monsterCollectionSheet == null ||
    data.stateQuery.monsterCollectionSheet.orderedList == null
  )
    return <></>;
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
    setDialog(true);
    const collectionTx = await collectionMutation();
    if(!collectionTx) {
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
            cartList.find((x) => x.collectionPhase === CollectionPhase.LATEST)?.tier || CollectionItemTier.TIER0
          }
        />
        </div>

      ) : (
        <div className={'MainRemainDisplayPos'}>
          <RemainingDisplay remainMin={remainTime} />
        </div>
      )}
      <div className={"CollectionItemList"}>
        {edit ? (tempCartList.map((x, i) => (
          <CollectionItem item={x} isEdit={edit} key={i} /> 
        ))) : (cartList.map((x, i) => (
          <CollectionItem item={x} isEdit={edit} key={i} /> 
        )))}
      </div>
        {edit ? (
          <div className={"MainCartContainer"}>
          <Cart
            cartList={tempCartList}
            totalGold={Number(collectionStatus?.monsterCollectionStatus.fungibleAssetValue.quantity || data.stateQuery.agent?.gold) + depositedGold}
            onCancel={() => {
              setEdit(false);
            }}
            onSubmit={handleSubmit}
            onRemove={removeCart}
            onPush={addCart}
          />
          </div>
        ) : (
          <div className={'MainCollectionPanelContainer'}>
            <CollectionPanel sheet={collectionSheet} tier={collectionState?.monsterCollectionState.level ? collectionState.monsterCollectionState.level : data.stateQuery.agent?.monsterCollectionLevel} onEdit={() => {setEdit(true)}}  />
          </div>
        )}
      

      <ConfirmationDialog open={dialog} />
      </div>

    </div>
  );
};

export default Main;
