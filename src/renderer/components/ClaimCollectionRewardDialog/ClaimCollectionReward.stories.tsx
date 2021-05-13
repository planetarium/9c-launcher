import { Meta, Story } from "@storybook/react";
import React from "react";
import { RewardCategory } from "../../../collection/types";
import ClaimCollectionRewardDialog, {Props} from "./ClaimCollectionRewardDialog";

export default {
  title: 'Renderer/Components/ClaimCollectionReward',
  component: ClaimCollectionRewardDialog,
} as Meta;


const Template: Story<Props> = (args) => <ClaimCollectionRewardDialog {...args}/>

export const Default = Template.bind({});
Default.args = {
  rewards: [
    {itemId: RewardCategory.AP, quantity: 10},
    {itemId: RewardCategory.HOURGLASS, quantity: 10000}
  ],
  avatar: [{address: '0xan8', name: 'HOTSIX'}],
  onActionTxId: () => {}
}

export const MultipleAvatar = Template.bind({});
MultipleAvatar.args = {
  rewards: [
    {itemId: RewardCategory.AP, quantity: 10},
    {itemId: RewardCategory.HOURGLASS, quantity: 10000}
  ],
  avatar: [
    {address: '0xan8fds', name: 'HOTSIX'},
    {address: '0xvbas8d', name: 'Starcraft'}
  ],
  onActionTxId: () => {}
}
