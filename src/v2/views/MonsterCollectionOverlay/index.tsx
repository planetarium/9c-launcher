import React, { useMemo, useRef, useState } from "react";
import {
  DepositButton2,
  DepositCancelButton,
  DepositContent,
  DepositDescription,
  DepositForm,
  DepositHolder,
  DepositTitle,
  MonsterCollectionOverlayBase,
  theme,
  Title,
} from "./base";
import { Item, ItemGroup, RewardSheet } from "./reward";
import { observer } from "mobx-react";
import { OverlayProps } from "src/v2/utils/types";

import titleImg from "src/v2/resources/monster-collection-title.png";
import ncgImg from "src/v2/resources/collection/items/ncg.png";
import { Level, Levels } from "./level";
import BareInput from "src/v2/components/ui/BareInput";

import monster1Img from "src/v2/resources/collection/monster-1.png";
import monster2Img from "src/v2/resources/collection/monster-2.png";
import monster3Img from "src/v2/resources/collection/monster-3.png";
import monster4Img from "src/v2/resources/collection/monster-4.png";
import monster5Img from "src/v2/resources/collection/monster-5.png";

import {
  CurrentStakingQuery,
  StakingSheetQuery,
  useStakingSheetQuery,
  useCurrentStakingQuery,
} from "src/v2/generated/graphql";
import { useBalance } from "src/v2/utils/useBalance";
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
  onChangeAmount(amount: number): Promise<void>;
}

const images = [
  monster1Img,
  monster2Img,
  monster3Img,
  monster4Img,
  monster5Img,
];

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
}: MonsterCollectionOverlayProps) {
  const [isEditing, setIsEditing] = useState(initalEditing ?? false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // FIXME: These useMemo calls performs a O(n) search for the item, usually twice.
  const currentIndex = useMemo(
    () =>
      stakeState &&
      sheet?.orderedList?.findLastIndex(
        (v) => stakeState?.deposit >= v.requiredGold
      ),
    [stakeState, sheet]
  );
  const selectedIndex = useMemo(
    () =>
      Math.max(
        sheet?.orderedList?.findLastIndex((v) => amount >= v.requiredGold) || 0,
        0
      ),
    [sheet, amount]
  );

  if (!sheet || !sheet?.orderedList || !stakeState) return null;
  const rewards = isEditing
    ? sheet.orderedList[selectedIndex!]?.rewards
    : sheet.orderedList[currentIndex!]?.rewards;
  const currentAmount = isEditing ? amount : stakeState.deposit;

  return (
    <>
      <Title src={titleImg} />
      <DepositHolder>
        <DepositForm>
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
                  onChange={(e) => setAmount(e.target.valueAsNumber)}
                  type="number"
                />
                <sub>/{currentNCG}</sub>
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAlertOpen(true);
                }}
              >
                Save
              </DepositButton2>
            </>
          ) : (
            <>
              <DepositContent>
                {stakeState.deposit}
                <sub>/{currentNCG}</sub>
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
        <DepositDescription>
          When you deposit NCG, the monsters go on an expedition to get the
          treasure.
        </DepositDescription>
      </DepositHolder>
      <Levels>
        {sheet.orderedList?.map((item, index) => (
          <Level
            key={item.level}
            amount={item.requiredGold}
            expandedImage={isEditing ? images[item.level] : undefined}
            current={currentIndex === index}
            selected={selectedIndex === index}
          />
        ))}
      </Levels>
      <RewardSheet>
        <ItemGroup key="recurring" title="Recurring Rewards">
          {rewards?.map((item) => (
            <Item
              key={item.itemId}
              amount={Math.floor(currentAmount / item.rate)}
              title={"NCG"}
            >
              <img src={ncgImg} />
            </Item>
          ))}
        </ItemGroup>
      </RewardSheet>
      <Alert
        title="Information"
        onCancel={() => setIsAlertOpen(false)}
        onConfirm={() => {
          onChangeAmount(amount);
          setIsAlertOpen(false);
        }}
        isOpen={isAlertOpen}
      >
        Do you really want to reduce your deposit?
        <br />
        The rewards will be lowered, and all the deposit periods for long-term
        compensation will be reset.
      </Alert>
    </>
  );
}

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  const { data: sheet } = useStakingSheetQuery();
  const { data: current } = useCurrentStakingQuery();
  const balance = useBalance();

  if (!sheet || !current) return null;

  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} onClose={onClose}>
      <MonsterCollectionContent sheet={sheet} current={current} />
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
