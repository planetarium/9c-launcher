import React from "react";
import { Story, Meta } from "@storybook/react";
import MainPage from "./main";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import montserrat from "src/renderer/styles/font";
import { OverlayProps } from "src/v2/utils/types";

export default {
  title: "Transfer/Pages/Main",
  component: MainPage,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Props: OverlayProps = {
  isOpen: true,
  onClose: () => {},
};

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

const Template: Story<OverlayProps> = () => (
  <ThemeProvider theme={theme}>
    <MainPage {...Props} />
  </ThemeProvider>
);

export const Default = Template.bind({});
Default.args = {};
