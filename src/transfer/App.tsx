import { createMuiTheme, ThemeProvider, useEventCallback } from "@material-ui/core";
import { GraphQLClient } from "graphql-request";
import React, { useMemo } from "react";
import { useEffect } from "react";
import { getSdk } from "src/generated/graphql-request";
import { IStoreContainer } from "src/interfaces/store";
import { ITransferStoreContainer, StoreContext } from "./hooks";
import MainPage from "./pages/main/main";
import MenuStore from "./stores/views/menu";
import HeadlessStore from "./stores/headless";
import TransferPageStore from "./stores/views/transfer";
import './App.scss';
import montserrat from "src/renderer/styles/font";

const client = new GraphQLClient(`http://localhost:23061/graphql`);
const headlessGraphQLSDK = getSdk(client);

const storeContainer: ITransferStoreContainer = {
  headlessStore: new HeadlessStore(headlessGraphQLSDK),
  menuStore: new MenuStore(),
  transferPage: new TransferPageStore()
}

const handleDetailView = (tx: string) => {
  if (process.versions['electron']) {
    import('electron')
      .then(({ shell }) => {
        shell.openExternal(
          `https://explorer.libplanet.io/9c-main/transaction/?${tx}`);
      });
  }
}

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
      if(!success) {
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
  )
};

export default App;
