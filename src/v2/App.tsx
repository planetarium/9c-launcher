import { ApolloProvider } from "@apollo/client";
import React from "react";
import { ipcRenderer } from "electron";
import { HashRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import useApolloClient from "./utils/apolloClient";
import APVSubscriptionProvider from "./utils/APVSubscriptionProvider";
import "./global.scss";
import { StoreProvider, useStore } from "./utils/useStore";
import { LocaleProvider } from "src/renderer/i18n";
import { ExternalURLProvider } from "./utils/useExternalURL";
import { getSdk } from "src/generated/graphql-request";
import { NodeInfo } from "src/config";
import { GraphQLClient } from "graphql-request";

function App() {
  const { transfer } = useStore();

  ipcRenderer.invoke("get-node-info").then((node: NodeInfo) => {
    transfer.updateSdk(
      getSdk(
        new GraphQLClient(`http://${node.host}:${node.graphqlPort}/graphql`)
      )
    );
  });

  const client = useApolloClient();

  if (!client) return null;

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

export default App;
