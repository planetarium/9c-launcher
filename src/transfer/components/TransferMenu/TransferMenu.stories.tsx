import React from "react";
import { Story, Meta } from "@storybook/react";

import TransferMenu from "./TransferMenu";
import { ITransferStoreContainer, StoreContext } from "src/transfer/hooks";
import MockedHeadlessStore from "src/transfer/stores/mockHeadless";
import MenuStore from "src/transfer/stores/views/menu";
import TransferPageStore from "src/transfer/stores/views/transfer";
import SwapPageStore from "src/transfer/stores/views/swap";

export default {
  title: "Transfer/Menu",
  component: TransferMenu,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const storeContainer: ITransferStoreContainer = {
  headlessStore: new MockedHeadlessStore(),
  menuStore: new MenuStore(),
  transferPage: new TransferPageStore(),
  swapPage: new SwapPageStore(),
};

const Template: Story = () => (
  <StoreContext.Provider value={storeContainer}>
    <TransferMenu />
  </StoreContext.Provider>
);

export const Default = Template.bind({});
Default.args = {
  open: true,
};
