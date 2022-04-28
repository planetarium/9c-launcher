import React from "react";
import {
  DepositButton2,
  DepositContent,
  DepositForm,
  DepositTitle,
  MonsterCollectionOverlayBase,
  RewardSheetContent,
  theme,
  Title,
} from "./base";
import { observer } from "mobx-react";
import { OverlayProps } from "src/v2/utils/types";
import titleImg from "src/v2/resources/monster-collection-title.png";

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} className={theme}>
      <Title src={titleImg} />
      <DepositForm>
        <DepositTitle>Deposit</DepositTitle>
        <DepositContent>
          0<sub>/500</sub>
        </DepositContent>
        <DepositButton2>Edit</DepositButton2>
      </DepositForm>
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
