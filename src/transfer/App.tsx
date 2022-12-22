import {
  createMuiTheme,
  ThemeProvider,
  useEventCallback,
} from "@material-ui/core";
import { GraphQLClient } from "graphql-request";
import React, { useMemo, useState } from "react";
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
import { ipcRenderer } from "electron";
import ApolloClient from "apollo-client";

// Set dummy url for initialize
const client = new GraphQLClient("");
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
      if (network === "9c-main")
        shell.openExternal(`https://9cscan.com/tx/${tx}`);
      else
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

  const [agentAddress, setAgentAddress] = useState<string>("");

  useEffect(() => {
    async function main() {
      if (!agentAddress) {
        ipcRenderer.on(
          "initialize transfer window",
          async (_, address, account, headlessUrl) => {
            console.log(
              `initialize transfer window at Transfer App.tsx. address: ${address}, node: ${headlessUrl}`
            );
            const client = new GraphQLClient(`http://${headlessUrl}/graphql`);
            const headlessGraphQLSDK = getSdk(client);
            storeContainer.headlessStore.updateSdk(headlessGraphQLSDK);
            storeContainer.headlessStore.updateAccount(account);
            setAgentAddress(address);
          }
        );
        return;
      }
      const success = await storeContainer.headlessStore.trySetAgentAddress(
        agentAddress
      );
      if (!success) {
        //FIXME: make a error page and show it.
        throw new Error("Could not set agent address");
      }
      const publicKey = await storeContainer.headlessStore.account;
      await storeContainer.headlessStore.updateBalance(agentAddress);
    }
    main();
  }, [agentAddress]);

  if (!agentAddress) return null;

  return (
    <StoreContext.Provider value={storeContainer}>
      <ThemeProvider theme={theme}>
        <MainPage
          agentAddress={agentAddress}
          onDetailedView={handleDetailView}
        />
      </ThemeProvider>
    </StoreContext.Provider>
  );
};

export default App;
