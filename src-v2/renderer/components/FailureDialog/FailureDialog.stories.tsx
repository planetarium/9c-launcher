import React from "react";
import { Story, Meta } from "@storybook/react";

import FailureDialog, { Props } from "./FailureDialog";

export default {
  title: "Transfer/FailureDialog",
  component: FailureDialog,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = (args) => <FailureDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
};
