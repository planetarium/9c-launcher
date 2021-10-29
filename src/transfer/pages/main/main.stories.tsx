import React from "react";
import { Story, Meta } from "@storybook/react";

import MainPage, { Props } from "./main";
import { ITransferStoreContainer, StoreContext } from "src/transfer/hooks";
import MockedHeadlessStore from "src/transfer/stores/mockHeadless";
import MenuStore from "src/transfer/stores/views/menu";
import TransferPageStore from "src/transfer/stores/views/transfer";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import montserrat from "src/renderer/styles/font";
import SwapPageStore from "src/transfer/stores/views/swap";

export default {
  title: "Transfer/Pages/Main",
  component: MainPage,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
  typography: {
    fontFamily: "Montserrat",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        "@font-face": [montserrat],
      },
    },
  },
});

const storeContainer: ITransferStoreContainer = {
  headlessStore: new MockedHeadlessStore(),
  menuStore: new MenuStore(),
  transferPage: new TransferPageStore(),
  swapPage: new SwapPageStore(),
};

const Template: Story<Props> = (props: Props) => (
  <StoreContext.Provider value={storeContainer}>
    <ThemeProvider theme={theme}>
      <MainPage {...props} />
    </ThemeProvider>
  </StoreContext.Provider>
);

export const Default = Template.bind({});
Default.args = {};
