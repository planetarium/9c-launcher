import React from "react";
import { Story, Meta } from "@storybook/react";

import SendingDialog, { Props } from "./SendingDialog";

export default {
  title: "Transfer/SendingDialog",
  component: SendingDialog,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = (args) => <SendingDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
};
