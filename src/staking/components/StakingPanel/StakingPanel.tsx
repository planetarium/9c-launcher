import React, { useEffect, useState } from "react";
import { RewardCategory, StakingItemTier, StakingSheetItem } from "../../types";
import StakingButton from "../Button/Button";
import {
  getExpectedReward,
  getRewardCategoryList,
  getTotalStakingGold,
} from "../common/stakingSheet";

import "./StakingPanel.scss";

export type Props = {
  sheet: StakingSheetItem[];
  tier: StakingItemTier;
  onEdit: () => void;
};

const StakingPanel: React.FC<Props> = (props: Props) => {
  const { sheet, tier, onEdit } = props;
  const [currentReward, setCurrentReward] = useState<
    Map<RewardCategory, number>
  >(new Map<RewardCategory, number>());

  useEffect(() => {
    setCurrentReward(getExpectedReward(sheet, tier));
  }, [sheet, tier]);

  return (
    <div className={"StakingPanelContainer"}>
      <div className={"StakingPanelBackground"}>
        <div className={'StakingPanelInfo'}>
          <p>Monster Collection</p>
          <ul>
            <li>
              Collect various monsters, then you can earn!
            </li>
            <li>
              NCG is required to collect.
            </li>
            <li>
              Reward cycle is about 7 days.
            </li>
          </ul>
        </div>
        <div>{getTotalStakingGold(sheet, tier)}</div>
        {getRewardCategoryList().map((x) => (
          <div>
            {RewardCategory[x]}/{currentReward.get(x)}
          </div>
        ))}
        <div className={'StakingPanelButton'}>
        <StakingButton
          onClick={onEdit}
          width={140}
          height={55}
          primary={true}
        >
          Edit
        </StakingButton>
        </div>

      </div>
    </div>
  );
};

export default StakingPanel;
