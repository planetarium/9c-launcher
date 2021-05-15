import React, { useEffect, useState } from "react";
import {
  RewardCategory,
  CollectionItemTier,
  CollectionSheetItem,
} from "../../types";
import CollectionButton from "../Button/Button";
import {
  getExpectedReward,
  getRewardCategoryList,
  getTotalDepositedGold,
} from "../common/collectionSheet";

import "./CollectionPanel.scss";

export type Props = {
  sheet: CollectionSheetItem[];
  tier: CollectionItemTier;
  onEdit: () => void;
};

const CollectionPanel: React.FC<Props> = (props: Props) => {
  const { sheet, tier, onEdit } = props;
  const [currentReward, setCurrentReward] = useState<
    Map<RewardCategory, number>
  >(new Map<RewardCategory, number>());

  useEffect(() => {
    setCurrentReward(getExpectedReward(sheet, tier));
  }, [sheet, tier]);

  return (
    <div className={"CollectionPanelContainer"}>
      <div className={"CollectionPanelBackground"}>
        <div className={"CollectionPanelInfo"}>
          <p>Monster Collection</p>
          <ul>
            <li>Gather various monsters with NCG!</li>
            <li>NCG is required to collect.</li>
            <li>Rewards can be received about every 7 days.</li>
          </ul>
        </div>
        <div>MY BALANCE</div>
        <div>{getTotalDepositedGold(sheet, tier)}</div>
        {getRewardCategoryList().map((x) => (
          <div>
            {RewardCategory[x]}/{currentReward.get(x)}
          </div>
        ))}
        <div>Rewards</div>
        <div className={"CollectionPanelButton"}>
          <CollectionButton
            onClick={onEdit}
            width={140}
            height={55}
            primary={true}
          >
            Edit
          </CollectionButton>
        </div>
      </div>
    </div>
  );
};

export default CollectionPanel;
