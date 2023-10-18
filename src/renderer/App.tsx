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
import { NodeInfo } from "src/config";
import { GraphQLClient } from "graphql-request";
import { observer } from "mobx-react";

function App() {
  const { transfer, rpc } = useStore();
  const client = useApolloClient();
  useEffect(() => {
    ipcRenderer.invoke("get-node-info").then((node: NodeInfo) => {
      transfer.updateSdk(
        getSdk(
          new GraphQLClient(`http://${node.host}:${node.graphqlPort}/graphql`),
        ),
      );

      rpc.setNode(node);
    });
  }, []);

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

export default observer(App);
