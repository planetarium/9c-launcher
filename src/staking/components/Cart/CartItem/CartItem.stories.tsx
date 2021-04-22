import React from 'react';
import { Story, Meta } from '@storybook/react';

import CartItem, {Props} from './CartItem';
import { StakingItemTier, StakingPhase } from '../../../types';


export default {
  title: 'Staking/CartItem',
  component: CartItem,
  argTypes: {
      clickItem: {
          action: 'click'
      }
  }
} as Meta;

const Template: Story<Props> = (args) => <CartItem {...args}/>;

export const Primary = Template.bind({});
Primary.args = {
    item: {
        tier: StakingItemTier.TIER1,
        stakingPhase: StakingPhase.STAKED,
        value: 10000
    },
    canStake: true,
}

export const Add = Template.bind({});
Add.args = {
    item: {
        tier: StakingItemTier.TIER1,
        stakingPhase: StakingPhase.CANDIDATE,
        value: 10000
    },
    canStake: true,
}

export const Lock = Template.bind({});
Lock.args = {
    item: {
        tier: StakingItemTier.TIER1,
        stakingPhase: StakingPhase.LOCKED,
        value: 10000
    },
    canStake: true,
}

export const CannotStake = Template.bind({});
CannotStake.args = {
    item: {
        tier: StakingItemTier.TIER1,
        stakingPhase: StakingPhase.LATEST,
        value: 10000
    },
    canStake: false,
}

