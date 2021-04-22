import React, { useEffect, useState } from "react";
import BackgroundImage from "../../common/resources/staking_bg.png";

import StakingItem from "../../components/StakingItem/StakingItem";
import Cart from "../../components/Cart/Cart";
import { Reward, StakingItemTier, StakingPhase, StakingSheetItem } from "../../types";

import "./main.scss";
import ConfirmationDialog from "../../components/ConfirmationDialog/Dialog";
import {
  useCancelStakingMutation,
  useStakingMutation,
  useStakingSheetWithStakingStateQuery,
  useStagedTxQuery,
  useMinerAddressQuery,
  useStakingSheetWithStakingStateLazyQuery,
  useStakingStatusSubscription,
} from "../../../generated/graphql";
import { StakingItemModel } from "../../models/staking";
import ExpectedStatusBoard from "../../components/ExpectedStatusBoard/ExpectedStatusBoard";
import StakingPanel from "../../components/StakingPanel/StakingPanel";

const getStakingPhase = (level: number, stakingLevel: number): StakingPhase => {
  if (level === stakingLevel + 1) return StakingPhase.CANDIDATE;
  else if (level > stakingLevel) return StakingPhase.LOCKED;
  else if (level === stakingLevel) return StakingPhase.LATEST;
  else return StakingPhase.STAKED;
};

const Main: React.FC = () => {
  const [agentAddress, setAgentAddress] = useState<string>("");
  const [cartList, setCart] = useState<StakingItemModel[]>([]);
  const [stakingSheet, setStakingSheet] = useState<StakingSheetItem[]>([]);
  const [dialog, setDialog] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [stakedGold, setStakedGold] = useState<number>(0);
  const [stakingSheetQuery, {
    loading,
    error,
    data,
    refetch,
  }] = useStakingSheetWithStakingStateLazyQuery({
    variables: {
      address: agentAddress,
    },
  });
  const { data: stagedTx, refetch: stagedTxRefetch } = useStagedTxQuery({
    variables: {
      address: agentAddress,
    },
  });
  const { data: minerAddress, error: minerError } = useMinerAddressQuery();
  const [
    staking,
    { data: isStaked, error: stakingError },
  ] = useStakingMutation();
  const [
    cancelStaking,
    { data: isCancelStaking, error: cancelStakingError },
  ] = useCancelStakingMutation();

  const {data: stakingStatus} = useStakingStatusSubscription();

  useEffect(() => {
    if (
      data?.stateQuery.stakingSheet == null ||
      data.stateQuery.stakingSheet.orderedList == null
    )
      return;
    setCart((state) => []);
    setStakingSheet((state) => []);
    data!.stateQuery.stakingSheet!.orderedList!.map((x) => {
      setCart((state) =>
        state.concat({
          tier: x!.level,
          stakingPhase: getStakingPhase(
            x!.level,
            data!.stateQuery.agent!.stakingLevel
          ),
          value: x!.requiredGold,
        } as StakingItemModel)
      );
      setStakingSheet((state) =>
        state.concat({
          level: x?.level,
          requiredGold: x?.requiredGold,
          reward: x?.rewards.map((x) => {
            return {
              quantity: x?.quantity,
              itemId: x?.itemId,
            } as Reward;
          }),
        } as StakingSheetItem)
      );
    });
  }, [data, loading]);

  useEffect(() => {
    if (
      data?.stateQuery.stakingSheet == null ||
      data.stateQuery.stakingSheet.orderedList == null
    )
      return;
    if (data?.stateQuery.agent == null) return;
    setStakedGold(0);
    data.stateQuery.stakingSheet.orderedList.forEach((tier) => {
      if (data.stateQuery.agent!.stakingLevel >= tier!.level) {
        setStakedGold((x) => x + tier!.requiredGold);
      }
    });
  }, [data, loading]);

  useEffect(() => {
    if(data?.stateQuery) refetch();
    else stakingSheetQuery();
  }, [agentAddress]);

  useEffect(() => {
    console.log(minerAddress);
    if (minerAddress != null) {
      setAgentAddress(minerAddress?.minerAddress!);
    }
  }, [minerAddress]);

  if (loading) return <p>loading</p>;
  if (error) return <p>error</p>;
  if (
    data?.stateQuery.stakingSheet == null ||
    data.stateQuery.stakingSheet.orderedList == null
  )
    return <></>;
  const addCart = (item: StakingItemModel) => {
    if (item.stakingPhase != StakingPhase.CANDIDATE) return;

    setCart((state) =>
      state.map((x) =>
        x.tier === item.tier - 1
          ? ({ ...x, stakingPhase: StakingPhase.STAKED } as StakingItemModel)
          : x
      )
    );
    setCart((state) =>
      state.map((x) =>
        x.tier === item.tier
          ? ({ ...x, stakingPhase: StakingPhase.LATEST } as StakingItemModel)
          : x
      )
    );
    setCart((state) =>
      state.map((x) =>
        x.tier === item.tier + 1
          ? ({ ...x, stakingPhase: StakingPhase.CANDIDATE } as StakingItemModel)
          : x
      )
    );
  };

  const removeCard = (item: StakingItemModel) => {
    if (item.stakingPhase != StakingPhase.LATEST) return;

    setCart((state) =>
      state.map((x) =>
        x.tier === item.tier - 1
          ? ({ ...x, stakingPhase: StakingPhase.LATEST } as StakingItemModel)
          : x
      )
    );
    setCart((state) =>
      state.map((x) =>
        x.tier === item.tier
          ? ({ ...x, stakingPhase: StakingPhase.CANDIDATE } as StakingItemModel)
          : x
      )
    );
    setCart((state) =>
      state.map((x) =>
        x.tier === item.tier + 1
          ? ({ ...x, stakingPhase: StakingPhase.LOCKED } as StakingItemModel)
          : x
      )
    );
  };

  const stakingMutation = async () => {
    const latestStakingItem = cartList.find(
      (x) => x.stakingPhase === StakingPhase.LATEST
    );
    if (!latestStakingItem) return;

    if (data.stateQuery.agent!.stakingLevel < latestStakingItem.tier) {
      console.log("staking");
      const stakingResult = await staking({
        variables: { level: latestStakingItem.tier },
      });
      return stakingResult.data!.action!.stake as string;
    } else if (data.stateQuery.agent!.stakingLevel > latestStakingItem.tier) {
      console.log("cancel staking");
      const stakingResult = await cancelStaking({
        variables: { level: latestStakingItem.tier },
      });
      return stakingResult.data!.action!.cancelStaking as string;
    } else {
      return;
    }
  };

  const handleSubmit = async () => {
    setDialog(true);
    const stakingTx = await stakingMutation();

    while (stakingTx) {
      const stagedTx = await stagedTxRefetch();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const tx = stagedTx!.data.nodeStatus.stagedTxIds!.find(
        (x) => x === stakingTx
      );
      if (!tx) break;
    }
    await refetch();

    setDialog(false);
    setEdit(false);
  };

  return (
    <div
      className={"MainContainer"}
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {edit ? (
        <ExpectedStatusBoard
          stakingSheet={stakingSheet}
          currentTier={data.stateQuery.agent?.stakingLevel}
          targetTier={
            cartList.find((x) => x.stakingPhase === StakingPhase.LATEST)?.tier || StakingItemTier.TIER0
          }
        />
      ) : (
        <></>
      )}
      <div className={"StakingItemList"}>
        {cartList.map((x, i) => (
          <StakingItem item={x} key={i} />
        ))}
      </div>
      <div className={"MainCartContainer"}>
        {edit ? (
          <Cart
            cartList={cartList}
            totalGold={Number(stakingStatus?.stakingStatus.fungibleAssetValue.quantity || 0) + stakedGold}
            onCancel={() => {
              setEdit(false);
            }}
            onSubmit={handleSubmit}
            onRemove={removeCard}
            onPush={addCart}
          />
        ) : (
          <StakingPanel sheet={stakingSheet} tier={data.stateQuery.agent?.stakingLevel} onEdit={setEdit}  />
        )}
      </div>

      <ConfirmationDialog open={dialog} />
    </div>
  );
};

export default Main;
