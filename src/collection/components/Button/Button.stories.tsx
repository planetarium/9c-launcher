import React from "react";
import { Story, Meta } from "@storybook/react";

import Button, { Props } from "./Button";

export default {
  title: "Collection/Button",
  component: Button,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: "OK",
  width: 200,
  height: 50,
  primary: true,
};

export const Cancel = Template.bind({});
Cancel.args = {
  children: "Cancel",
  width: 200,
  height: 50,
  primary: false,
};
