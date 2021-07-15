import React, { useMemo, useEffect } from "react";
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
import { LOCAL_SERVER_URL } from "../config";
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

const wsLink = new WebSocketLink({
  uri: `ws://${LOCAL_SERVER_URL}/graphql`,
  options: {
    reconnect: true,
  },
});

const httpLink = createHttpLink({ uri: `http://${LOCAL_SERVER_URL}/graphql` });

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

  function listenOnlineStatus() {
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
  }

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/Start");
    listenOnlineStatus();
  }, []);

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
