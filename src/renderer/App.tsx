import React, { useMemo, useEffect, useState } from "react";
import { Router } from "react-router";
import { createBrowserHistory } from "history";
import "./styles/common.scss";
import ApolloClient from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import { ApolloProvider } from "react-apollo";
import { getMainDefinition } from "apollo-utilities";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import { Provider } from "mobx-react";
import AccountStore from "./stores/account";
import { IStoreContainer } from "../interfaces/store";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import GameStore from "./stores/game";
import Root from "./Root";
import StandaloneStore from "./stores/standaloneStore";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { DifferentAppProtocolVersionSubscriptionProvider } from "./DifferentAppProtocolVersionSubscriptionProvider";
import { NotificationSubscriptionProvider } from "./NotificationSubscriptionProvider";
import montserrat from "./styles/font";
import { t } from "@transifex/native";
import { ipcRenderer } from "electron";
import { LocaleProvider } from "./i18n";
import type { NodeInfo } from "../config";
import RPCSpinner from "./components/RPCSpinner/RPCSpinner";
import { PreloadEndedDocument, PreloadEndedQuery } from "src/generated/graphql";
import { Update } from "src/main/update";
import {
  GenesisHashDocument,
  GenesisHashQuery,
} from "src/v2/generated/graphql";

const Store: IStoreContainer = {
  accountStore: new AccountStore(),
  routerStore: new RouterStore(),
  gameStore: new GameStore(),
  standaloneStore: new StandaloneStore(),
};

const history = syncHistoryWithStore(
  createBrowserHistory({
    basename: window.location.pathname,
  }),
  Store.routerStore
);

function App() {
  const [client, setClient] = useState<ApolloClient<any>>();
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
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        window.alert(
          t(
            "Internet connection has been lost. Unable to connect. Please check your network connection.",
            { _tags: "app" }
          )
        );
      }

      ipcRenderer.send(
        "online-status-changed",
        navigator.onLine ? "online" : "offline"
      );
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    async function main() {
      if (!client) {
        const node: NodeInfo = await ipcRenderer.invoke("get-node-info");
        const headlessUrl = `${node.host}:${node.graphqlPort}`;
        const wsLink = new WebSocketLink({
          uri: `ws://${headlessUrl}/graphql`,
          options: {
            reconnect: true,
            connectionCallback() {
              client
                .query<PreloadEndedQuery>({
                  query: PreloadEndedDocument,
                })
                .then(({ data }) => {
                  const apv = data!.nodeStatus.appProtocolVersion;
                  if (!apv) return;
                  ipcRenderer.send("encounter different version", {
                    newer: apv.version,
                    extras: apv.extra,
                  } as Update);
                });
            },
          },
        });
        const httpLink = createHttpLink({
          uri: `http://${headlessUrl}/graphql`,
        });

        const apiLink = split(
          // split based on operation type
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          httpLink
        );

        const link = ApolloLink.from([new RetryLink(), apiLink]);

        const client = new ApolloClient({
          link: link,
          cache: new InMemoryCache(),
        });

        client
          .query<GenesisHashQuery>({
            query: GenesisHashDocument,
          })
          .then((result) => {
            if (!result.data) return;
            ipcRenderer.send(
              "set-genesis-hash",
              result.data.nodeStatus.genesis.hash
            );
          });

        setClient(client);
      }
    }
    main();
  }, [client]);

  if (!client)
    return (
      <Provider {...Store}>
        <ThemeProvider theme={theme}>
          <LocaleProvider>
            <RPCSpinner />
          </LocaleProvider>
        </ThemeProvider>
      </Provider>
    );

  return (
    <ApolloProvider client={client}>
      <DifferentAppProtocolVersionSubscriptionProvider>
        <NotificationSubscriptionProvider />
        <Router history={history}>
          <Provider {...Store}>
            <ThemeProvider theme={theme}>
              <LocaleProvider>
                <Root />
              </LocaleProvider>
            </ThemeProvider>
          </Provider>
        </Router>
      </DifferentAppProtocolVersionSubscriptionProvider>
    </ApolloProvider>
  );
}

export default App;
