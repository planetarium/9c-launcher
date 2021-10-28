import React from "react";
import { Story, Meta } from "@storybook/react";

import RenewDialog, { Props } from "./RenewDialog";

export default {
  title: "Collection/RenewDialog",
  component: RenewDialog,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = (args) => <RenewDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
};
