import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { ipcRenderer } from "electron";
import { createBrowserHistory } from "history";
import { Provider } from "mobx-react";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import React, { useMemo, useEffect } from "react";
import { ApolloProvider } from "react-apollo";
import { Router } from "react-router";

import { LOCAL_SERVER_URL, electronStore } from "../config";
import { AppLocale, Locale } from "../interfaces/i18n";
import { IStoreContainer } from "../interfaces/store";

import { DifferentAppProtocolVersionSubscriptionProvider } from "./DifferentAppProtocolVersionSubscriptionProvider";
import LocaleProvider, { useLocale } from "./i18n";
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
    ipcRenderer.on("failed to download binary", (event) => {
      window.alert(locale("바이너리 다운로드에 실패했습니다. 인터넷 연결 상태를 확인한 후에 다시 시도해주십시오."));
    });

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
