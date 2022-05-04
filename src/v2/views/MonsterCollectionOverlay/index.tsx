import React from "react";
import {
  DepositButton2,
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

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  return (
    <MonsterCollectionOverlayBase isOpen={isOpen}>
      <Title src={titleImg} />
      <DepositHolder>
        <DepositForm>
          <DepositTitle>Deposit</DepositTitle>
          <DepositContent>
            0<sub>/500</sub>
          </DepositContent>
          <DepositButton2>Edit</DepositButton2>
        </DepositForm>
        <DepositDescription>
          When you deposit NCG, the monsters go on an expedition to get the
          treasure.
        </DepositDescription>
      </DepositHolder>
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
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
