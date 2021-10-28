import React from "react";
import { Story, Meta } from "@storybook/react";

import CollectionItem, { Props } from "./CollectionItem";
import { CollectionItemTier, CollectionPhase } from "../../types";

export default {
  title: "Collection/CollectionItem",
  component: CollectionItem,
  argTypes: {
    clickItem: {
      action: "click",
    },
  },
} as Meta;

const Template: Story<Props> = (args) => <CollectionItem {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  item: {
    tier: CollectionItemTier.TIER1,
    collectionPhase: CollectionPhase.COLLECTED,
    value: 10000,
  },
};
