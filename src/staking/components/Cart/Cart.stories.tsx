import React from 'react';
import { Story, Meta } from '@storybook/react';

import Cart, {Props} from './Cart';
import { StakingItemTier, StakingPhase } from '../../../staking/types';

export default {
  title: 'Staking/Cart',
  component: Cart,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const Template: Story<Props> = (args) => <Cart {...args}/>;

const cartList = [
    {
        "tier": StakingItemTier.TIER1,
        "stakingPhase": StakingPhase.STAKED,
        "value": 10000
    },
    {
        "tier": StakingItemTier.TIER2,
        "stakingPhase": StakingPhase.STAKED,
        "value": 20000
    },
    {
        "tier": StakingItemTier.TIER3,
        "stakingPhase": StakingPhase.LATEST,
        "value": 30000
    },
    {
        "tier": StakingItemTier.TIER4,
        "stakingPhase": StakingPhase.CANDIDATE,
        "value": 40000
    },
    {
        "tier": StakingItemTier.TIER5,
        "stakingPhase": StakingPhase.LOCKED,
        "value": 50000
    },
    {
        "tier": StakingItemTier.TIER6,
        "stakingPhase": StakingPhase.LOCKED,
        "value": 60000
    },
    {
        "tier": StakingItemTier.TIER7,
        "stakingPhase": StakingPhase.LOCKED,
        "value": 70000
    },
]

export const Empty = Template.bind({});
Empty.args = {
    cartList: cartList,
    currentGold: 30000
}
