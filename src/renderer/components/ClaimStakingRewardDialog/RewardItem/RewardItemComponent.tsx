import React from "react"
import { Reward, RewardCategory } from "../../../../staking/types"
import apIcon from '../../../resources/ap.png';
import hourglassIcon from '../../../resources/hourglass.png';

import './RewardItemComponent.scss';

export type Props = {
  reward: Reward
}

const RewardItemComponent: React.FC<Props> = (props: Props) => {
  const {reward} = props;
  return <div>
    <img className='RewardItemRectangle' src={reward.itemId === RewardCategory.AP ? apIcon : hourglassIcon} />
    <div className='RewardItemQuantityRectangle'>
      {reward.quantity}
    </div>
  </div>
}

export default RewardItemComponent
