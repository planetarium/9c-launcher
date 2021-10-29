import React from "react";
import { Story, Meta } from "@storybook/react";

import CartItem, { Props } from "./CartItem";
import { CollectionItemTier, CollectionPhase } from "../../../types";

export default {
  title: "Collection/CartItem",
  component: CartItem,
  argTypes: {
    clickItem: {
      action: "click",
    },
  },
} as Meta;

const Template: Story<Props> = (args) => <CartItem {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  item: {
    tier: CollectionItemTier.TIER1,
    collectionPhase: CollectionPhase.COLLECTED,
    value: 10000,
  },
  canCollect: true,
};

export const Add = Template.bind({});
Add.args = {
  item: {
    tier: CollectionItemTier.TIER1,
    collectionPhase: CollectionPhase.CANDIDATE,
    value: 10000,
  },
  canCollect: true,
};

export const Lock = Template.bind({});
Lock.args = {
  item: {
    tier: CollectionItemTier.TIER1,
    collectionPhase: CollectionPhase.LOCKED,
    value: 10000,
  },
  canCollect: true,
};

export const CannotCollect = Template.bind({});
CannotCollect.args = {
  item: {
    tier: CollectionItemTier.TIER1,
    collectionPhase: CollectionPhase.LATEST,
    value: 10000,
  },
  canCollect: false,
};
