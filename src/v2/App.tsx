import { hot } from "react-hot-loader";
import { ApolloProvider } from "@apollo/client";
import React from "react";
import { HashRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import useApolloClient from "./utils/apolloClient";
import APVSubscriptionProvider from "./utils/APVSubscriptionProvider";
import "./global.scss";
import { StoreProvider } from "./utils/useStore";
import { LocaleProvider } from "src/renderer/i18n";

function App() {
  const client = useApolloClient();

  if (!client) return null;

  return (
    <LocaleProvider>
      <ApolloProvider client={client}>
        <StoreProvider>
          <APVSubscriptionProvider>
            <Router>
              <Routes />
            </Router>
          </APVSubscriptionProvider>
        </StoreProvider>
      </ApolloProvider>
    </LocaleProvider>
  );
}

export default hot(module)(App);
