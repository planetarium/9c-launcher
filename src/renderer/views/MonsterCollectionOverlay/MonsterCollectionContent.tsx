import Decimal from "decimal.js";
import deepEqual from "deep-equal";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  DepositRightButton,
  DepositLeftButton,
  DepositContent,
  DepositDescription,
  DepositForm,
  DepositHolder,
  DepositTitle,
  LoadingBackdrop,
  LoadingDescription,
  LoadingImage,
  Title,
  MigrateLeftButton,
} from "./base";
import { Item, ItemGroup, RewardSheet, RewardSheetPlaceholder } from "./reward";
import { Level, Levels } from "./level";

import BareInput from "src/renderer/components/ui/BareInput";
import titleImg from "src/renderer/resources/collection/title.png";
import loadingImg from "src/renderer/resources/collection/loading.png";
import monster1Img from "src/renderer/resources/collection/monster-1.png";
import monster2Img from "src/renderer/resources/collection/monster-2.png";
import monster3Img from "src/renderer/resources/collection/monster-3.png";
import monster4Img from "src/renderer/resources/collection/monster-4.png";
import monster5Img from "src/renderer/resources/collection/monster-5.png";
import monster6Img from "src/renderer/resources/collection/monster-6.png";
import monster7Img from "src/renderer/resources/collection/monster-7.png";
import monster8Img from "src/renderer/resources/collection/monster-8.png";

import itemMetadata from "src/utils/monsterCollection/items";
import systemRewards from "src/utils/monsterCollection/systemRewards";

import { CloseButton } from "src/renderer/components/core/OverlayBase";
import { getRemain } from "src/utils/monsterCollection/utils";
import { useEvent } from "src/utils/useEvent";
import { Alert } from "./dialog";

import {
  UserStakingQuery,
  LatestStakingSheetQuery,
} from "src/generated/graphql";

declare global {
  interface Array<T> {
    findLastIndex: Array<T>["findIndex"];
  }
}

interface MonsterCollectionOverlayProps {
  latestSheet: LatestStakingSheetQuery;
  current: UserStakingQuery;
  isEditing?: boolean;
  currentNCG: number;
  onStake(amount: Decimal): void;
  onClose(): void;
  tip: number;
  isLoading: boolean;
  children?: React.ReactNode;
}

type LevelList =
  | NonNullable<
      LatestStakingSheetQuery["stateQuery"]["latestStakeRewards"]
    >["orderedList"]
  | NonNullable<
      UserStakingQuery["stateQuery"]["stakeState"]
    >["stakeRewards"]["orderedList"]
  | null
  | undefined;

type Rewards = {
  count(amount: Decimal): Decimal;
  __typename?: "StakeRegularRewardInfoType" | undefined;
  itemId: number;
  decimalRate: Decimal;
}[];

type Alerts = "lower-deposit" | "confirm-changes" | "unclaimed" | "minimum";

const images = [
  monster1Img,
  monster2Img,
  monster3Img,
  monster4Img,
  monster5Img,
  monster6Img,
  monster7Img,
  monster8Img,
];

function useRewardIndex(levels: LevelList, amount: Decimal = new Decimal(0)) {
  return useMemo(() => {
    const index = levels?.findLastIndex((v) => amount?.gte(v.requiredGold));
    return index != null && index !== -1 ? index : null;
  }, [amount, levels]);
}

function useRewards(levels: LevelList, index: number = 0) {
  const rewards = levels?.[index]?.rewards;
  const bonusRewards = levels?.[index]?.bonusRewards;
  const bonusRewardMap = useMemo(
    () =>
      bonusRewards &&
      new Map(bonusRewards.map((v) => [v.itemId, v.count] as const)),
    [bonusRewards],
  );

  return rewards?.map((v) => {
    let itemID = v.itemId;
    if (v.type === "CURRENCY") {
      if (v.currencyTicker === "CRYSTAL") itemID = 1;
      if (v.currencyTicker === "GARAGE") itemID = 2;
    }
    return {
      ...v,
      itemId: itemID,
      count(amount: Decimal) {
        return amount
          .divToInt(v.decimalRate)
          .add(bonusRewardMap?.get(itemID) || 0);
      },
    };
  });
}

export function MonsterCollectionContent({
  latestSheet: {
    stateQuery: { latestStakeRewards: latestSheet },
  },
  current: {
    stateQuery: { stakeState },
  },
  isEditing: initialEditing,
  currentNCG,
  onStake,
  children,
  onClose,
  tip,
  isLoading,
}: MonsterCollectionOverlayProps) {
  const [isEditing, setIsEditing] = useState(initialEditing ?? false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("0");
  const [openedAlert, setIsAlertOpen] = useState<Alerts | null>(null);

  const deposit = useMemo(
    () => stakeState && new Decimal(stakeState.deposit),
    [stakeState, currentNCG],
  );

  const [isMigratable, setIsMigratable] = useState<boolean>(
    !!deposit &&
      deposit.gt(0) &&
      !deepEqual(stakeState?.stakeRewards, latestSheet, { strict: true }),
  );

  const amountDecimal = useMemo(() => new Decimal(amount || 0), [amount]);

  const latestLevels = useMemo(
    () => latestSheet?.orderedList.filter((v) => v.level !== 0),
    [latestSheet],
  );
  const userLevels = useMemo(() => {
    if (isMigratable) {
      return stakeState?.stakeRewards.orderedList.filter((v) => v.level !== 0);
    } else {
      return latestLevels;
    }
  }, [isMigratable, stakeState]);

  const availableNCG = useMemo(
    () => deposit?.add(currentNCG) ?? new Decimal(currentNCG),
    [],
  );

  useEffect(() => {
    if (stakeState?.deposit) setAmount(stakeState.deposit.replace(/\.0+$/, ""));
  }, [stakeState]);

  const Stake = useEvent(() => {
    if (deposit?.eq(amountDecimal)) setIsMigratable(false);
    onStake(amountDecimal);
    setIsAlertOpen(null);
    setIsEditing(false);
  });

  const userIndex = useRewardIndex(userLevels, deposit ?? new Decimal(0));
  const deltaIndex = useRewardIndex(latestLevels, amountDecimal);
  const isLockedUp = !!stakeState && tip <= stakeState.cancellableBlockIndex;

  const currentRewards = useRewards(userLevels, userIndex ?? 0);
  const deltaRewards = useRewards(latestLevels, deltaIndex ?? 0);

  function RecurringReward(currentRewards: Rewards, deltaRewards?: Rewards) {
    const targetReward =
      deltaRewards && deltaRewards.length > currentRewards.length
        ? deltaRewards
        : currentRewards;
    return targetReward.map((item, index) => {
      const itemMeta = itemMetadata[item.itemId] ?? { name: "Unknown" };

      const deltaReward = deltaRewards?.find(
        (reward) => reward.itemId === item.itemId,
      );
      const currentItem = currentRewards.find(
        (reward) => reward.itemId === item.itemId,
      );

      const itemAmount = currentItem
        ? currentItem.count(deposit ?? new Decimal(0))
        : new Decimal(0);

      const updatedAmount = deltaReward
        ? deltaReward.count(amountDecimal)
        : itemAmount;

      const isUpgrade = deltaReward ? updatedAmount.gt(itemAmount) : false;
      const isDiff = !updatedAmount.eq(itemAmount);

      return (
        <Item
          key={item.itemId}
          amount={itemAmount.toString()}
          title={itemMeta.name}
          isUpgrade={isUpgrade}
          updatedAmount={updatedAmount.toString()}
          isDiff={isDiff}
        >
          <img src={itemMeta.img} alt={itemMeta.name} height={48} />
        </Item>
      );
    });
  }

  const contentVariant = useMemo(() => {
    const canvasMain = document.createElement("canvas");
    const contextMain = canvasMain.getContext("2d");

    const canvasSub = document.createElement("canvas");
    const contextSub = canvasSub.getContext("2d");

    if (!contextMain || !contextSub) {
      return "large";
    }

    contextMain.font = "bold 46px Fira Sans Condensed";
    contextSub.font = "bold 24px Fira Sans Condensed";

    const width =
      contextMain.measureText(amount).width +
      contextSub.measureText(`/${availableNCG.toNumber().toLocaleString()}`)
        .width;

    return width > 350 ? "small" : "large";
  }, [amount, availableNCG]);

  if (!latestLevels) return null;

  return (
    <>
      <CloseButton onClick={() => onClose()} />
      <Title src={titleImg} />
      <AnimatePresence>
        {isLoading && (
          <LoadingBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingImage src={loadingImg} />
            <LoadingDescription>Processing Staking...</LoadingDescription>
          </LoadingBackdrop>
        )}
      </AnimatePresence>
      <DepositHolder>
        <DepositForm
          onSubmit={(e) => {
            e.preventDefault();
            if (stakeState && tip >= stakeState.claimableBlockIndex)
              setIsAlertOpen("unclaimed");
            else if (stakeState && amountDecimal.lt(stakeState.deposit))
              setIsAlertOpen("lower-deposit");
            else if (amountDecimal.lt(latestLevels[0].requiredGold))
              setIsAlertOpen("minimum");
            else if (stakeState) setIsAlertOpen("confirm-changes");
            else Stake();
          }}
        >
          <DepositTitle>Deposit</DepositTitle>
          {isEditing ? (
            <>
              <DepositContent
                stacking={contentVariant}
                onClick={() => inputRef.current?.focus()}
              >
                <BareInput
                  ref={inputRef}
                  value={amount}
                  onChange={(e) => {
                    if (e.target.valueAsNumber < 999999999)
                      setAmount(`${e.target.valueAsNumber}`);
                    if (e.target.value.length === 0) setAmount("0");
                    return;
                  }}
                  min="0"
                  max={availableNCG.toNumber()}
                  type="number"
                />
                <sub>/{availableNCG.toNumber().toLocaleString()}</sub>
              </DepositContent>
              <DepositLeftButton
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(false);
                }}
              >
                Cancel
              </DepositLeftButton>
              <DepositRightButton
                disabled={
                  amountDecimal.gt(availableNCG) ||
                  (deposit && deposit.eq(0) && amountDecimal.eq(0)) ||
                  (isLockedUp &&
                    isMigratable &&
                    amountDecimal.lt(stakeState.deposit)) ||
                  (isLockedUp &&
                    !isMigratable &&
                    amountDecimal.lte(stakeState.deposit))
                }
              >
                Save
              </DepositRightButton>
            </>
          ) : (
            <>
              <DepositContent>
                {stakeState?.deposit?.replace(/\.0+$/, "") ?? 0}
                <sub>/{availableNCG.toNumber().toLocaleString()}</sub>
                {isMigratable && (
                  <input hidden value={stakeState?.deposit} type="number" />
                )}
              </DepositContent>
              {isMigratable && (
                <MigrateLeftButton type="submit">Migrate</MigrateLeftButton>
              )}
              <DepositRightButton
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                Edit
              </DepositRightButton>
            </>
          )}
        </DepositForm>
        {isEditing && isLockedUp && amountDecimal.lt(stakeState.deposit) && (
          <DepositDescription warning>
            Deposits cannot be withdrawn within 28 days.
          </DepositDescription>
        )}
        <DepositDescription>
          When you deposit NCG, the monsters go on an expedition to get the
          treasure.
        </DepositDescription>
        {!isEditing && stakeState && tip >= stakeState.startedBlockIndex && (
          <DepositDescription>
            About {getRemain(tip - stakeState.startedBlockIndex)} of deposit
            days!
          </DepositDescription>
        )}
      </DepositHolder>
      <Levels>
        {latestLevels.map((item, index) => (
          <Level
            key={item.level}
            amount={item.requiredGold}
            expandedImage={
              isEditing || userIndex === index ? images[index] : undefined
            }
            current={userIndex === index}
            selected={isEditing && deltaIndex === index}
            disabled={isEditing && availableNCG.lt(item.requiredGold)}
            onClick={() => setAmount(String(item.requiredGold))}
          />
        ))}
      </Levels>
      <AnimatePresence exitBeforeEnter>
        {currentRewards ? (
          <RewardSheet>
            <ItemGroup key="recurring" title="Recurring Rewards">
              {RecurringReward(currentRewards, deltaRewards)}
            </ItemGroup>
            <ItemGroup key="system" title="System Rewards">
              {systemRewards.map((item) => {
                const sysRewardSuffix = item.name === "stage" ? "% DC" : "%";
                const amount =
                  item.amount[userIndex === null ? 0 : userIndex + 1];
                const updatedAmount =
                  item.amount[deltaIndex === null ? 0 : deltaIndex + 1];
                return (
                  <Item
                    key={item.title}
                    amount={amount + sysRewardSuffix}
                    updatedAmount={updatedAmount + sysRewardSuffix}
                    isUpgrade={updatedAmount > amount}
                    isDiff={updatedAmount !== amount}
                    title={item.title}
                  >
                    <img src={item.img} alt={item.title} height={48} />
                  </Item>
                );
              })}
            </ItemGroup>
          </RewardSheet>
        ) : (
          <RewardSheetPlaceholder />
        )}
      </AnimatePresence>
      <Alert
        title="Information"
        onCancel={() => setIsAlertOpen(null)}
        onConfirm={Stake}
        isOpen={openedAlert === "lower-deposit"}
      >
        Do you really want to reduce your deposit?
        <br />
        The rewards will be lowered, and all the deposit periods for long-term
        compensation will be reset.
      </Alert>
      <Alert
        title="Confirmation"
        onCancel={() => setIsAlertOpen(null)}
        onConfirm={Stake}
        isOpen={openedAlert === "confirm-changes"}
      >
        When you create new stake contract,
        <br />
        the daily count is initialized to 0. <br />
        The reward is given every week and cannot be changed to a less amount
        within 28 days.
        <br />
        Do you want to proceed?
      </Alert>
      <Alert
        title="Error"
        onConfirm={() => setIsAlertOpen(null)}
        isOpen={openedAlert === "unclaimed"}
      >
        You can't modify it because there is a reward that you didn't receive.
        Please make a claim and try again.
      </Alert>
      <Alert
        title="Error"
        onConfirm={() => setIsAlertOpen(null)}
        isOpen={openedAlert === "minimum"}
      >
        You can't stake less than {latestLevels[0].requiredGold} NCG.
      </Alert>
      {children}
    </>
  );
}
