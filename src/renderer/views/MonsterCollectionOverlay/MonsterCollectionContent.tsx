import Decimal from "decimal.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DepositButton2,
  DepositCancelButton,
  DepositContent,
  DepositDescription,
  DepositForm,
  DepositHolder,
  DepositTitle,
  LoadingBackdrop,
  LoadingDescription,
  LoadingImage,
  Title,
} from "./base";
import { Item, ItemGroup, RewardSheet, RewardSheetPlaceholder } from "./reward";

import BareInput from "src/renderer/components/ui/BareInput";
import titleImg from "src/renderer/resources/collection/title.png";
import { Level, Levels } from "./level";

import loadingImg from "src/renderer/resources/collection/loading.png";

import monster1Img from "src/renderer/resources/collection/monster-1.png";
import monster2Img from "src/renderer/resources/collection/monster-2.png";
import monster3Img from "src/renderer/resources/collection/monster-3.png";
import monster4Img from "src/renderer/resources/collection/monster-4.png";
import monster5Img from "src/renderer/resources/collection/monster-5.png";
import itemMetadata from "src/utils/monsterCollection/items";

import systemRewards from "src/utils/monsterCollection/systemRewards";

import { AnimatePresence } from "framer-motion";
import { CurrentStakingQuery, StakingSheetQuery } from "src/generated/graphql";
import { CloseButton } from "src/renderer/components/core/OverlayBase";
import { getRemain } from "src/utils/monsterCollection/utils";
import { useEvent } from "src/utils/useEvent";
import { Alert } from "./dialog";

declare global {
  interface Array<T> {
    findLastIndex: Array<T>["findIndex"];
  }
}

interface MonsterCollectionOverlayProps {
  sheet: StakingSheetQuery;
  current: CurrentStakingQuery;
  isEditing?: boolean;
  currentNCG: number;
  onChangeAmount(amount: Decimal): void;
  onClose(): void;
  tip: number;
  isLoading: boolean;
  children?: React.ReactNode;
}

const images = [
  monster1Img,
  monster2Img,
  monster3Img,
  monster4Img,
  monster5Img,
];

type LevelList =
  | NonNullable<StakingSheetQuery["stateQuery"]["stakeRewards"]>["orderedList"]
  | null
  | undefined;

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
    [bonusRewards]
  );

  return rewards?.map((v) => ({
    ...v,
    count(amount: Decimal) {
      return amount.divToInt(v.rate).add(bonusRewardMap?.get(v.itemId) || 0);
    },
  }));
}

type Alerts = "lower-deposit" | "confirm-changes" | "unclaimed" | "minimum";

export function MonsterCollectionContent({
  sheet: {
    stateQuery: { stakeRewards: sheet },
  },
  current: {
    stateQuery: { stakeState },
  },
  isEditing: initalEditing,
  currentNCG,
  onChangeAmount,
  children,
  onClose,
  tip,
  isLoading,
}: MonsterCollectionOverlayProps) {
  const [isEditing, setIsEditing] = useState(initalEditing ?? false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("0");
  const [openedAlert, setIsAlertOpen] = useState<Alerts | null>(null);

  const deposit = useMemo(
    () => stakeState && new Decimal(stakeState.deposit),
    [stakeState]
  );
  const amountDecimal = useMemo(() => new Decimal(amount || 0), [amount]);
  const levels = useMemo(
    () => sheet?.orderedList.filter((v) => v.level !== 0),
    [sheet]
  );

  const availableNCG = useMemo(
    () => deposit?.add(currentNCG) ?? new Decimal(currentNCG),
    [deposit, currentNCG]
  );

  const currentIndex = useRewardIndex(levels, deposit ?? new Decimal(0));
  const selectedIndex = useRewardIndex(levels, amountDecimal);
  const isLockedUp = !!stakeState && tip <= stakeState.cancellableBlockIndex;

  useEffect(() => {
    if (stakeState?.deposit) setAmount(stakeState.deposit.replace(/\.0+$/, ""));
  }, [stakeState]);

  const changeAmount = useEvent(() => {
    onChangeAmount(amountDecimal);
    setIsAlertOpen(null);
    setIsEditing(false);
  });

  const currentRewards = useRewards(levels, currentIndex ?? 0);
  const selectedRewards = useRewards(levels, selectedIndex ?? 0);

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

  if (!levels) return null;

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
            if (stakeState && amountDecimal.lt(stakeState.deposit))
              setIsAlertOpen("lower-deposit");
            else if (stakeState && tip >= stakeState.claimableBlockIndex)
              setIsAlertOpen("unclaimed");
            else if (amountDecimal.lt(levels[0].requiredGold))
              setIsAlertOpen("minimum");
            else if (stakeState) setIsAlertOpen("confirm-changes");
            else changeAmount();
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
              <DepositCancelButton
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(false);
                }}
              >
                Cancel
              </DepositCancelButton>
              <DepositButton2
                disabled={
                  amountDecimal.gt(availableNCG) ||
                  (deposit && amountDecimal.eq(deposit)) ||
                  (isLockedUp && amountDecimal.lt(stakeState.deposit))
                }
              >
                Save
              </DepositButton2>
            </>
          ) : (
            <>
              <DepositContent>
                {stakeState?.deposit?.replace(/\.0+$/, "") ?? 0}
                <sub>/{availableNCG.toNumber().toLocaleString()}</sub>
              </DepositContent>
              <DepositButton2
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                Edit
              </DepositButton2>
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
        {levels.map((item, index) => (
          <Level
            key={item.level}
            amount={item.requiredGold}
            expandedImage={
              isEditing || currentIndex === index ? images[index] : undefined
            }
            current={currentIndex === index}
            selected={isEditing && selectedIndex === index}
            disabled={isEditing && availableNCG.lt(item.requiredGold)}
            onClick={() => setAmount(String(item.requiredGold))}
          />
        ))}
      </Levels>
      <AnimatePresence exitBeforeEnter>
        {currentRewards ? (
          <RewardSheet>
            <ItemGroup key="recurring" title="Recurring Rewards">
              {currentRewards.map((item, index) => {
                const itemMeta = itemMetadata[item.itemId] ?? {
                  name: "Unknown",
                };
                const selectedAmount = isEditing
                  ? selectedRewards?.[index].count(amountDecimal)
                  : null;
                const itemAmount = item.count(deposit ?? new Decimal(0));
                return (
                  <Item
                    key={item.itemId}
                    amount={itemAmount.toString()}
                    title={itemMeta.name}
                    isUpgrade={selectedAmount?.gte(itemAmount)}
                    updatedAmount={selectedAmount?.toString()}
                    isDiff
                  >
                    <img src={itemMeta.img} alt={itemMeta.name} />
                  </Item>
                );
              })}
            </ItemGroup>
            <ItemGroup key="system" title="System Rewards">
              {systemRewards.map((item) => {
                const sysRewardSuffix = item.name === "stage" ? "% DC" : "%";
                const amount = item.amount[currentIndex ?? 0];
                const updatedAmount = item.amount[selectedIndex ?? 0];
                return (
                  <Item
                    key={item.title}
                    amount={isEditing ? "" : amount + sysRewardSuffix}
                    updatedAmount={
                      isEditing ? updatedAmount + sysRewardSuffix : ""
                    }
                    isUpgrade={updatedAmount >= amount}
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
        onConfirm={changeAmount}
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
        onConfirm={changeAmount}
        isOpen={openedAlert === "confirm-changes"}
      >
        When the deposit amount is modified, the daily count is initialized to
        0. <br />
        The reward is given every week and cannot be changed to a small amount
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
        You can't stake less than {levels[0].requiredGold} NCG.
      </Alert>
      {children}
    </>
  );
}
