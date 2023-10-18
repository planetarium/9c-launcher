import { ApolloProvider } from "@apollo/client";
import React, { useEffect } from "react";
import { ipcRenderer } from "electron";
import { HashRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import useApolloClient from "src/utils/apolloClient";
import APVSubscriptionProvider from "src/utils/APVSubscriptionProvider";
import "./global.scss";
import { StoreProvider, useStore } from "src/utils/useStore";
import { LocaleProvider } from "src/renderer/i18n";
import { ExternalURLProvider } from "src/utils/useExternalURL";
import { getSdk } from "src/generated/graphql-request";
import { GraphQLClient } from "graphql-request";
import { observer } from "mobx-react";
import { Planet } from "src/interfaces/registry";
import { NodeInfo } from "src/config";

function App() {
  const { transfer, planetary } = useStore();

  useEffect(() => {
    ipcRenderer
      .invoke("get-planetary-info")
      .then((info: [Planet[], NodeInfo]) => {
        planetary.init(info[0], info[1]);
        transfer.updateSdk(getSdk(new GraphQLClient(planetary.node!.gqlUrl)));
      });
  }, []);

  if (planetary.node === null) return null;
  const client = useApolloClient()!;

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
