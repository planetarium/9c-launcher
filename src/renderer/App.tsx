import { ApolloProvider, HttpLink } from "@apollo/client";
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

function App() {
  const { transfer, planetary } = useStore();
  const client = useApolloClient();

  useEffect(() => {
    console.log(planetary.node);
    transfer.updateSdk(getSdk(new GraphQLClient(planetary.node.gqlUrl)));
    client?.setLink(
      new HttpLink({
        uri: planetary.node.gqlUrl,
      }),
    );
  }, [planetary.planet]);

  if (!client) return null;

  return (
    <LocaleProvider>
      <StoreProvider>
        <ApolloProvider client={client}>
          <APVSubscriptionProvider>
            <ExternalURLProvider>
              <Router>
                <Routes />
              </Router>
            </ExternalURLProvider>
          </APVSubscriptionProvider>
        </ApolloProvider>
      </StoreProvider>
    </LocaleProvider>
  );
}

export default observer(App);
