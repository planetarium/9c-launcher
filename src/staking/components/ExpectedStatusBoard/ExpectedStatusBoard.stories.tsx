import React from 'react';
import { Story, Meta } from '@storybook/react';

import ExpectedStatusBoard, {Props} from './ExpectedStatusBoard';
import { RewardCategory, StakingItemTier, StakingPhase, StakingSheetItem } from '../../../staking/types';

export default {
  title: 'Staking/ExpectedStatusBoard',
  component: ExpectedStatusBoard,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const Template: Story<Props> = (args) => <ExpectedStatusBoard {...args}/>;

const sheet: StakingSheetItem[] = [
  {
    level: StakingItemTier.TIER1,
    reward: [{
      itemId: RewardCategory.HOURGLASS,
      quantity: 50
    }],
    requiredGold: 500
  },
  {
    level: StakingItemTier.TIER2,
    reward: [{
      itemId: RewardCategory.HOURGLASS,
      quantity: 100
    },{
      itemId: RewardCategory.AP,
      quantity: 1
    }],
    requiredGold: 1000
  },  
  {
    level: StakingItemTier.TIER3,
    reward: [{
      itemId: RewardCategory.HOURGLASS,
      quantity: 150
    },{
      itemId: RewardCategory.AP,
      quantity: 2
    }],
    requiredGold: 5000
  },
]

export const Default = Template.bind({});
Default.args = {
  stakingSheet: sheet,
  currentTier: StakingItemTier.TIER0,
  targetTier: StakingItemTier.TIER2,
}
