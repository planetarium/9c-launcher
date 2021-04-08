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
import { HttpLink } from "apollo-link-http";

import { Provider } from "mobx-react";
import AccountStore from "./stores/account";
import { IStoreContainer } from "../interfaces/store";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import { LOCAL_SERVER_URL, electronStore } from "../config";
import GameStore from "./stores/game";
import Root from "./Root";
import StandaloneStore from "./stores/standaloneStore";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { DifferentAppProtocolVersionSubscriptionProvider } from "./DifferentAppProtocolVersionSubscriptionProvider";
import NotificationSubscriptionProvider from "./NotificationSubscriptionProvider";
import montserrat from "./styles/font";

import LocaleProvider, { useLocale } from "./i18n";
import { Locale, AppLocale } from "../interfaces/i18n";
import { ipcRenderer } from "electron";
import { InMemoryCache } from "apollo-cache-inmemory";

const wsLink = new WebSocketLink({
  uri: `ws://${LOCAL_SERVER_URL}/graphql`,
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({ uri: `http://${LOCAL_SERVER_URL}/graphql`, credentials: "include" });

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

  const { locale } = useLocale<AppLocale>("appLocale");

  function listenOnlineStatus() {
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        window.alert(
          locale(
            "인터넷 연결이 끊겼습니다. 인터넷 연결 상태를 확인한 후에 다시 시도해주십시오."
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
        <Router history={history}>
          <Provider {...Store}>
            <NotificationSubscriptionProvider {...Store} />
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
