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
  Title,
} from "./base";
import { Item, ItemGroup, RewardSheet, RewardSheetPlaceholder } from "./reward";

import titleImg from "src/v2/resources/collection/title.png";
import { Level, Levels } from "./level";
import BareInput from "src/v2/components/ui/BareInput";

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
  tip?: number;
}

const images = [
  monster1Img,
  monster2Img,
  monster3Img,
  monster4Img,
  monster5Img,
];

type Alerts = "lower-deposit" | "confirm-changes";

export function MonsterCollectionContent({
  sheet: {
    stateQuery: { stakeRegularRewardSheet: sheet },
  },
  current: {
    stateQuery: { stakeState },
  },
  isEditing: initalEditing,
  currentNCG,
  onChangeAmount,
  tip,
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

  const isLockedUp =
    tip != null && !!stakeState && tip <= stakeState.cancellableBlockIndex;

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
  const currentAmount = isEditing || !deposit ? amountDecimal : deposit;

  return (
    <>
      <Title src={titleImg} />
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
      </DepositHolder>
      <Levels>
        {levels?.map((item, index) => (
          <Level
            key={item.level}
            amount={item.requiredGold}
            expandedImage={
              isEditing || currentIndex === index ? images[index] : undefined
            }
            current={currentIndex === index}
            selected={isEditing && selectedIndex === index}
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
                return (
                  <Item
                    key={item.itemId}
                    amount={currentAmount.divToInt(item.rate).toString()}
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
    </>
  );
}
