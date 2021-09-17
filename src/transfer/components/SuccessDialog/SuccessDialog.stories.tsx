import React from "react";
import { Story, Meta } from "@storybook/react";

import SuccessDialog, { Props } from "./SuccessDialog";

export default {
  title: "Transfer/SuccessDialog",
  component: SuccessDialog,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = (args) => <SuccessDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
};
