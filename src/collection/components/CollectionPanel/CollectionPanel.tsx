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

import MyCollectionIcon from '../../common/resources/loading.png'
import ApIcon from '../../common/resources/ui-staking-slot-item-01.png'
import HourglassIcon from '../../common/resources/ui-staking-slot-item-02.png'

import "./CollectionPanel.scss";

export type Props = {
  sheet: CollectionSheetItem[];
  tier: CollectionItemTier;
  onEdit: () => void;
};

const getRewardImage = (item: RewardCategory) => {
  switch(item) {
    case RewardCategory.AP:
      return ApIcon;
    case RewardCategory.HOURGLASS:
      return HourglassIcon;
    default:
      throw Error(`${item} is not in ${JSON.stringify(RewardCategory)}`);
  }
}

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
          <p>MONSTER COLLECTION</p>
          <ul>
            <li>Gather various monsters with NCG!</li>
            <li>NCG is required to collect.</li>
            <li>Rewards can be received about every 7 days.</li>
          </ul>
        </div>
        <div className={"balance"}>
          <div className={'title'} >MY BALANCE</div>
          <img src={MyCollectionIcon} className={"monster"} />
          <div className={'deposit'}>{getTotalDepositedGold(sheet, tier)}</div>
        </div>
        <div className={"reward"}>
          <div className={'title'}>REWARDS</div>
          <div className={"CollectionRewardItemListContainer"}>
          {getRewardCategoryList().map((x) => (
            <div className={"CollectionRewardItemContainer"}>
              <div className={"CollectionRewardItemBackground"}>
                <img className={"CollectionRewardItemImage"} src={getRewardImage(x)}/>
              </div>
              <div className={'label'}>
              {currentReward.get(x) || 0}
              </div>
            </div>
          ))}
          </div>

        </div>

        <div className={"CollectionPanelButton"}>
          <CollectionButton
            onClick={onEdit}
            width={164}
            height={50}
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
