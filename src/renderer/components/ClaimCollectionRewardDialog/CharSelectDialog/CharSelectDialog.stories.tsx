import { Meta, Story } from "@storybook/react";
import { Provider } from "mobx-react";
import React from "react";
import { RewardCategory } from "../../../../collection/types";
import CharSelectDialog, { Props } from "./CharSelectDialog";

export default {
  title: "Renderer/Components/CharSelectDialog",
  component: CharSelectDialog,
} as Meta;

const Template: Story<Props> = (args) => <CharSelectDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  avatar: [{ address: "0xan8", name: "HOTSIX", updatedAt: 100023 }],
  onClick: () => {},
};

export const MultipleAvatar = Template.bind({});
MultipleAvatar.args = {
  avatar: [
    { address: "0xan8fds", name: "HOTSIX", updatedAt: 100023 },
    { address: "0xvbas8d", name: "Starcraft", updatedAt: 100064 },
  ],
  onClick: () => {},
};
