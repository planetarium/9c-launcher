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
  const { planetary, account, game } = useStore();
  const client = useApolloClient();

  /** Asynchronous Invoke in useEffect
   * As ipcRenderer.invoke() is async we're not guaranteed to receive IPC result on time
   *
   * Also even if we use .then() to force synchronous flow useEffect() won't wait.
   * But we need these to render login page.
   * hence we render null until all three initialized;
   * Planetary, GQL client, AccountStore
   *
   * It could be better if we can have react suspense here.
   */
  useEffect(() => {
    ipcRenderer
      .invoke("get-planetary-info")
      .then((info: [Planet[], NodeInfo]) => {
        planetary.init(info[0], info[1]);
      });
    ipcRenderer
      .invoke("check-geoblock")
      .then((v) => game.setGeoBlock(v.country, v.isWhitelist ?? false));
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
