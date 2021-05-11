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
  avatarAddresses: ['asdf'],
  onActionTxId: () => {}
}