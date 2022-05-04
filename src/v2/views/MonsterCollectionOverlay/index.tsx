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
import { ItemGroup, RewardSheet } from "./reward";
import { observer } from "mobx-react";
import { OverlayProps } from "src/v2/utils/types";
import titleImg from "src/v2/resources/monster-collection-title.png";

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} className={theme}>
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
        <ItemGroup title="Items">{"something".repeat(50)}</ItemGroup>
      </RewardSheet>
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
