import {
  createMuiTheme,
  ThemeProvider,
  useEventCallback,
} from "@material-ui/core";
import { GraphQLClient } from "graphql-request";
import React, { useMemo } from "react";
import { useEffect } from "react";
import { getSdk } from "src/generated/graphql-request";
import { ITransferStoreContainer, StoreContext } from "./hooks";
import MainPage from "./pages/main/main";
import MenuStore from "./stores/views/menu";
import HeadlessStore from "./stores/headless";
import TransferPageStore from "./stores/views/transfer";
import "./App.scss";
import montserrat from "src/renderer/styles/font";
import SwapPageStore from "./stores/views/swap";
import { get as getConfig } from "src/config";

const client = new GraphQLClient(`http://localhost:23061/graphql`);
const headlessGraphQLSDK = getSdk(client);

const storeContainer: ITransferStoreContainer = {
  headlessStore: new HeadlessStore(
    headlessGraphQLSDK,
    getConfig("SwapAddress") || "0x9093dd96c4bb6b44A9E0A522e2DE49641F146223"
  ),
  menuStore: new MenuStore(),
  transferPage: new TransferPageStore(),
  swapPage: new SwapPageStore(),
};

const handleDetailView = (tx: string) => {
  const network = getConfig("Network", "9c-main");
  if (process.versions["electron"]) {
    import("electron").then(({ shell }) => {
      shell.openExternal(
        `https://explorer.libplanet.io/${network}/transaction/?${tx}`
      );
    });
  }
};

const App: React.FC = () => {
  const theme = useMemo(
    () =>
      createMuiTheme({
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
      }),
    []
  );

  useEffect(() => {
    async function main() {
      const success = await storeContainer.headlessStore.trySetAgentAddress();
      if (!success) {
        //FIXME: make a error page and show it.
        throw new Error("Could not set agent address");
      }
      await storeContainer.headlessStore.updateBalance();
    }
    main();
  }, []);
  return (
    <StoreContext.Provider value={storeContainer}>
      <ThemeProvider theme={theme}>
        <MainPage onDetailedView={handleDetailView} />
      </ThemeProvider>
    </StoreContext.Provider>
  );
};

export default App;
