import { RewardCategory } from "src/staking/types"
import hourglass from "../../common/resources/hourglass.png";
import ap from "../../common/resources/ap.png";
import React from "react";

type Props = {
    value: number;
    rewardCategory: RewardCategory;
}

const getRewardCategoryIcon = (reward: RewardCategory): string => {
    if(reward === RewardCategory.HOURGLASS){
        return hourglass;
    }
    else {
        return ap;
    }
}

const RewardDisplay: React.FC<Props> = (props: Props) => {
    const { value, rewardCategory } = props;
    const icon = getRewardCategoryIcon(rewardCategory);
    return <div>
        <img src={icon}  />
    </div>

}