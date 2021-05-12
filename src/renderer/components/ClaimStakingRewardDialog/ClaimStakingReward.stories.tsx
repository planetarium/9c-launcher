import { Meta, Story } from "@storybook/react";
import { Provider } from "mobx-react";
import React from "react";
import { RewardCategory } from "../../../staking/types";
import AccountStore from "../../stores/account";
import ClaimStakingRewardDialog, {Props} from "./ClaimStakingRewardDialog";

export default {
  title: 'Renderer/Components/ClaimStakingReward',
  component: ClaimStakingRewardDialog,
} as Meta;


const Template: Story<Props> = (args) => <ClaimStakingRewardDialog {...args}/>

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
