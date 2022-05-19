import React from "react";
import { Story, Meta } from "@storybook/react";

import LoadingDialog, { Props } from "./LoadingDialog";

export default {
  title: "Collection/ConfirmationDialog",
  component: LoadingDialog,
  parameters: {
    actions: { argTypesRegex: "^on.*" },
    chromatic: { disableSnapshot: false },
  },
} as Meta;

const Template: Story<Props> = (args) => <LoadingDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
};
