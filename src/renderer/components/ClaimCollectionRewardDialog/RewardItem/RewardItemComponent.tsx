import React from "react"
import { Reward, RewardCategory } from "../../../../collection/types"
import apIcon from '../../../resources/ui-staking-slot-item-01.png';
import hourglassIcon from '../../../resources/ui-staking-slot-item-02.png';

import './RewardItemComponent.scss';

export type Props = {
  reward: Reward
}

const RewardItemComponent: React.FC<Props> = (props: Props) => {
  const {reward} = props;
  return <div className={'ClaimRewardItemContainer'}>
    <div className={"ClaimRewardItemBackground"}>
      <img src={reward.itemId === RewardCategory.AP ? apIcon : hourglassIcon} />
    </div>
    <div className={'label'}>
    {reward.quantity}
</div>
  </div>
}

export default RewardItemComponent
