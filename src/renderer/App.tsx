import { ApolloProvider } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { HashRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import useApolloClient from "src/utils/apolloClient";
import APVSubscriptionProvider from "src/utils/APVSubscriptionProvider";
import "./global.scss";
import { StoreProvider, useStore } from "src/utils/useStore";
import { LocaleProvider } from "src/renderer/i18n";
import { ExternalURLProvider } from "src/utils/useExternalURL";
import { observer } from "mobx-react";
import { Planet } from "src/interfaces/registry";
import { NodeInfo } from "src/config";

function App() {
  const { planetary, account } = useStore();
  const client = useApolloClient();
  useEffect(() => {
    ipcRenderer
      .invoke("get-planetary-info")
      .then((info: [Planet[], NodeInfo]) => {
        planetary.init(info[0], info[1]);
      });
  }, []);

  if (planetary.node === null) return null;
  if (!account.isInitialized) return null;
  if (client === null) return null;

  return (
    <LocaleProvider>
      <ApolloProvider client={client}>
        <StoreProvider>
          <APVSubscriptionProvider>
            <ExternalURLProvider>
              <Router>
                <Routes />
              </Router>
            </ExternalURLProvider>
          </APVSubscriptionProvider>
        </StoreProvider>
      </ApolloProvider>
    </LocaleProvider>
  );
}

export default observer(App);
