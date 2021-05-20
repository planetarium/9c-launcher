import React from "react";
import { Story, Meta } from "@storybook/react";

import Loading from "./loading";

export default {
  title: "Collection/Pages/Loading",
  component: Loading,
} as Meta;

const Template: Story = () => <Loading />;

export const Primary = Template.bind({});
