import { Meta, Story } from "@storybook/react";
import React from "react";
import { RewardCategory } from "../../../staking/types";
import RewardButton, {Props} from "./RewardButton";

export default {
  title: 'Renderer/Components/RewardButton',
  component: RewardButton,
} as Meta;


const Template: Story<Props> = (args) => <RewardButton {...args}/>

export const Default = Template.bind({});
Default.args = {
  loading: false,
  onClick: () => {},
}