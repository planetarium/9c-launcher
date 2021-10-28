import React from "react";
import { Story, Meta } from "@storybook/react";

import ExpectedStatusBoard, { Props } from "./ExpectedStatusBoard";
import {
  RewardCategory,
  CollectionItemTier,
  CollectionPhase,
  CollectionSheetItem,
} from "../../types";

export default {
  title: "Collection/ExpectedStatusBoard",
  component: ExpectedStatusBoard,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = (args) => <ExpectedStatusBoard {...args} />;

const sheet: CollectionSheetItem[] = [
  {
    level: CollectionItemTier.TIER1,
    reward: [
      {
        itemId: RewardCategory.HOURGLASS,
        quantity: 50,
      },
    ],
    requiredGold: 500,
  },
  {
    level: CollectionItemTier.TIER2,
    reward: [
      {
        itemId: RewardCategory.HOURGLASS,
        quantity: 100,
      },
      {
        itemId: RewardCategory.AP,
        quantity: 1,
      },
    ],
    requiredGold: 1000,
  },
  {
    level: CollectionItemTier.TIER3,
    reward: [
      {
        itemId: RewardCategory.HOURGLASS,
        quantity: 150,
      },
      {
        itemId: RewardCategory.AP,
        quantity: 2,
      },
    ],
    requiredGold: 5000,
  },
];

export const Default = Template.bind({});
Default.args = {
  collectionSheet: sheet,
  currentTier: CollectionItemTier.TIER0,
  targetTier: CollectionItemTier.TIER2,
};
