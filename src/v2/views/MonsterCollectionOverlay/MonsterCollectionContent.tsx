import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Decimal from "decimal.js";
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

import titleImg from "src/v2/resources/collection/title.png";
import { Level, Levels } from "./level";
import BareInput from "src/v2/components/ui/BareInput";

import loadingImg from "src/v2/resources/collection/loading.png";

import monster1Img from "src/v2/resources/collection/monster-1.png";
import monster2Img from "src/v2/resources/collection/monster-2.png";
import monster3Img from "src/v2/resources/collection/monster-3.png";
import monster4Img from "src/v2/resources/collection/monster-4.png";
import monster5Img from "src/v2/resources/collection/monster-5.png";
import itemMetadata from "src/v2/utils/monsterCollection/items";

import {
  CurrentStakingQuery,
  StakingSheetQuery,
} from "src/v2/generated/graphql";
import { Alert } from "./dialog";
import { AnimatePresence } from "framer-motion";
import { useEvent } from "src/v2/utils/useEvent";
import { CloseButton } from "src/v2/components/core/OverlayBase";
import { getRemain } from "src/collection/common/utils";

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
  onChangeAmount(amount: Decimal): Promise<unknown>;
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

type Alerts = "lower-deposit" | "confirm-changes" | "unclaimed";

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

  const deposit = useMemo(() => stakeState && new Decimal(stakeState.deposit), [
    stakeState,
  ]);
  const amountDecimal = useMemo(() => new Decimal(amount || 0), [amount]);
  const levels = useMemo(
    () => sheet?.orderedList.filter((v) => v.level !== 0),
    [sheet]
  );

  const availableNCG = useMemo(
    () => deposit?.add(currentNCG) ?? new Decimal(currentNCG),
    [deposit, currentNCG]
  );

  // FIXME: These useMemo calls performs a O(n) search for the item, usually twice.
  const currentIndex = useMemo(() => {
    if (!stakeState) return null;
    const index = levels?.findLastIndex((v) => deposit?.gte(v.requiredGold));
    return index != null && index !== -1 ? index : null;
  }, [stakeState, levels]);
  const selectedIndex = useMemo(() => {
    const index = levels?.findLastIndex((v) =>
      amountDecimal.gte(v.requiredGold)
    );
    return index != null && index !== -1 ? index : null;
  }, [amountDecimal, levels]);

  const isLockedUp = !!stakeState && tip <= stakeState.cancellableBlockIndex;

  useEffect(() => {
    if (stakeState && stakeState.deposit)
      setAmount(stakeState.deposit.replace(/\.0+$/, ""));
  }, [stakeState]);

  const changeAmount = useEvent(() => {
    onChangeAmount(amountDecimal);
    setIsAlertOpen(null);
    setIsEditing(false);
  });

  if (!levels) return null;

  const rewards = isEditing
    ? levels[selectedIndex!]?.rewards
    : levels[currentIndex!]?.rewards;
  const bonusRewards = isEditing
    ? levels[selectedIndex!]?.bonusRewards
    : levels[currentIndex!]?.bonusRewards;
  const bonusRewardMap = useMemo(
    () =>
      bonusRewards &&
      new Map(bonusRewards.map((v) => [v.itemId, v.count] as const)),
    [levels]
  );
  const currentAmount = isEditing || !deposit ? amountDecimal : deposit;

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
            else if (stakeState) setIsAlertOpen("confirm-changes");
            else changeAmount();
          }}
        >
          <DepositTitle>Deposit</DepositTitle>
          {isEditing ? (
            <>
              <DepositContent
                editable
                onClick={() => inputRef.current?.focus()}
              >
                <BareInput
                  maxLength={6}
                  ref={inputRef}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={availableNCG.toString()}
                  type="number"
                />
                <sub>/{availableNCG.toString()}</sub>
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
                <sub>/{availableNCG.toString()}</sub>
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
        {!isEditing && stakeState && tip < stakeState.claimableBlockIndex && (
          <DepositDescription>
            About {getRemain(stakeState.claimableBlockIndex - tip)} of deposit
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
        {rewards ? (
          <RewardSheet>
            <ItemGroup key="recurring" title="Recurring Rewards">
              {rewards?.map((item) => {
                const itemMeta = itemMetadata[item.itemId] ?? {
                  name: "Unknown",
                };
                const bonusCount = bonusRewardMap?.get(item.itemId) ?? 0;
                return (
                  <Item
                    key={item.itemId}
                    amount={currentAmount
                      .divToInt(item.rate)
                      .add(bonusCount)
                      .toString()}
                    title={itemMeta.name}
                  >
                    <img src={itemMeta.img} />
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
        onCancel={() => setIsAlertOpen(null)}
        onConfirm={() => setIsAlertOpen(null)}
        isOpen={openedAlert === "unclaimed"}
      >
        You can't modify it because there is a reward that you didn't receive.
        Please make a claim and try again.
      </Alert>
      {children}
    </>
  );
}
