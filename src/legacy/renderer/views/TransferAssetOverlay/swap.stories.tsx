import React from "react";
import { Story, Meta } from "@storybook/react";

import SwapPage from "./swap";

export default {
  title: "Transfer/Pages/Swap",
  component: SwapPage,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story = () => <SwapPage />;

export const Default = Template.bind({});
Default.args = {};
