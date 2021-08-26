import React from "react";
import { Story, Meta } from "@storybook/react";

import TextField, { TextFieldProps } from "./TextField";

export default {
  title: "v2/TextField",
  component: TextField,
  argTypes: {
    label: { control: "text" },
    invalid: { control: "boolean", defaultValue: false },
  },
} as Meta;

export const Default: Story<TextFieldProps> = (args) => {
  const [value, setValue] = React.useState("");
  return (
    <TextField
      value={value}
      onChange={(v) => setValue(v.target.value)}
      {...args}
    />
  );
};
