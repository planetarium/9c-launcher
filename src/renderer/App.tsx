import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import ApolloClient from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import { ApolloProvider } from "react-apollo";
import { getMainDefinition } from "apollo-utilities";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createBrowserHistory } from "history";
import mixpanel from "mixpanel-browser";
import { Provider } from "mobx-react";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import React, { useMemo, useEffect } from "react";
import { Router } from "react-router";

import { Locale } from "../interfaces/i18n";
import { IStoreContainer } from "../interfaces/store";
import { LOCAL_SERVER_URL, electronStore } from "../config";

import { DifferentAppProtocolVersionSubscriptionProvider } from "./DifferentAppProtocolVersionSubscriptionProvider";
import LocaleProvider from "./i18n";
import { NotificationSubscriptionProvider } from "./NotificationSubscriptionProvider";
import Root from "./Root";
import AccountStore from "./stores/account";
import GameStore from "./stores/game";
import StandaloneStore from "./stores/standaloneStore";
import "./styles/common.scss";
import montserrat from "./styles/font";

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

  useEffect(() => {
    mixpanel.track("Launcher/Start");
  }, []);

  return (
    <ApolloProvider client={client}>
      <DifferentAppProtocolVersionSubscriptionProvider>
        <NotificationSubscriptionProvider />
        <Router history={history}>
          <Provider {...Store}>
            <ThemeProvider theme={theme}>
              <LocaleProvider
                value={{ locale: electronStore.get("Locale") as Locale }}
              >
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
