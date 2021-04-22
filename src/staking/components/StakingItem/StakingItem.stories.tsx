import React from 'react';
import { Story, Meta } from '@storybook/react';

import StakingItem, {Props} from './StakingItem';
import { StakingItemTier, StakingPhase } from '../../../staking/types';

import './StakingItem.scss';

export default {
  title: 'Staking/StakingItem',
  component: StakingItem,
  argTypes: {
      clickItem: {
          action: 'click'
      }
  }
} as Meta;

const Template: Story<Props> = (args) => <StakingItem {...args}/>;

export const Primary = Template.bind({});
Primary.args = {
    item: {
        tier: StakingItemTier.TIER1,
        stakingPhase: StakingPhase.STAKED,
        value: 10000
    },
}
