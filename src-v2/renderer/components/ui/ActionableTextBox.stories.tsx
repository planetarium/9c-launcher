import React from "react";
import { Story, Meta } from "@storybook/react";

import { ActionableTextBoxWrapper, TextBox } from "./ActionableTextBox";
import { FolderOpen } from "@material-ui/icons";

export default {
  title: "V2/ActionableTextBox",
  component: ActionableTextBoxWrapper,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<{
  children: React.ReactNode;
  text: string;
}> = (args) => (
  <ActionableTextBoxWrapper>
    <TextBox>{args.text}</TextBox>
    {args.children}
  </ActionableTextBoxWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  text: "OK",
  children: <FolderOpen />,
};
