import React from "react";
import { Story, Meta } from "@storybook/react";

import TransferPage from "./transfer";

export default {
  title: "Transfer/Pages/Transfer",
  component: TransferPage,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = (props: Props) => <TransferPage />;

export const Default = Template.bind({});
Default.args = {};
