import React, { useRef, useState } from "react";
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

export function MonsterCollectionContent() {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
                  defaultValue={50}
                  type="number"
                />
                <sub>/500</sub>
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
              <DepositButton2>Save</DepositButton2>
            </>
          ) : (
            <>
              <DepositContent>
                0<sub>/500</sub>
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
        <Level amount={10} />
        <Level amount={100} />
        <Level amount={1000} />
        <Level amount={10000} />
        <Level amount={100000} />
      </Levels>
      <RewardSheet>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <ItemGroup key={i} title="One-time">
              <Item
                key="a"
                title={
                  <>
                    First
                    <br />
                    Reward
                  </>
                }
                amount={10}
              >
                <img src={ncgImg} />
              </Item>
              <Item
                key="b"
                title={
                  <>
                    Second
                    <br />
                    Reward
                  </>
                }
                amount={10}
              >
                <img src={ncgImg} />
              </Item>
            </ItemGroup>
          ))}
      </RewardSheet>
    </>
  );
}

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} onClose={onClose}>
      <MonsterCollectionContent />
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
