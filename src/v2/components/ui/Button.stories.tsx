import React from "react";
import { Story, Meta } from "@storybook/react";

import Button, { ButtonProps } from "./Button";

export default {
  title: "V2/Button",
  component: Button,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<React.PropsWithChildren<ButtonProps>> = (args) => (
  <Button {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  children: "OK",
  primary: true,
};

export const Cancel = Template.bind({});
Cancel.args = {
  children: "Cancel",
  primary: false,
};
