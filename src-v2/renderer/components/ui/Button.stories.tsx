import React from "react";
import { Story, Meta } from "@storybook/react";

import Button from "./Button";
import type * as Stitches from "@stitches/react";

export default {
  title: "V2/Button",
  component: Button,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<
  React.PropsWithChildren<Stitches.VariantProps<typeof Button>>
> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: "OK",
  variant: "primary",
};

export const Cancel = Template.bind({});
Cancel.args = {
  children: "Cancel",
};
