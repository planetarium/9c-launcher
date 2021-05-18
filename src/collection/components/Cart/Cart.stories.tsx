import React from 'react';
import { Story, Meta } from '@storybook/react';

import Cart, {Props} from './Cart';
import { CollectionItemTier, CollectionPhase } from '../../types';

export default {
  title: 'Collection/Cart',
  component: Cart,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const Template: Story<Props> = (args) => <Cart {...args}/>;

const cartList = [
    {
        "tier": CollectionItemTier.TIER1,
        "collectionPhase": CollectionPhase.COLLECTED,
        "value": 10000
    },
    {
        "tier": CollectionItemTier.TIER2,
        "collectionPhase": CollectionPhase.COLLECTED,
        "value": 20000
    },
    {
        "tier": CollectionItemTier.TIER3,
        "collectionPhase": CollectionPhase.LATEST,
        "value": 30000
    },
    {
        "tier": CollectionItemTier.TIER4,
        "collectionPhase": CollectionPhase.CANDIDATE,
        "value": 40000
    },
    {
        "tier": CollectionItemTier.TIER5,
        "collectionPhase": CollectionPhase.LOCKED,
        "value": 50000
    },
    {
        "tier": CollectionItemTier.TIER6,
        "collectionPhase": CollectionPhase.LOCKED,
        "value": 60000
    },
    {
        "tier": CollectionItemTier.TIER7,
        "collectionPhase": CollectionPhase.LOCKED,
        "value": 70000
    },
]

export const Empty = Template.bind({});
Empty.args = {
    cartList: cartList,
    totalGold: 30000
}
