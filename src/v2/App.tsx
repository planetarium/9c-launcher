import { hot } from "react-hot-loader";
import { ApolloProvider } from "@apollo/client";
import React from "react";
import { HashRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import client from "./utils/apolloClient";
import APVSubscriptionProvider from "./utils/APVSubscriptionProvider";
import "./global.scss";
import { StoreProvider } from "./utils/useStore";

function App() {
  return (
    <ApolloProvider client={client}>
      <StoreProvider>
        <APVSubscriptionProvider>
          <Router>
            <Routes />
          </Router>
        </APVSubscriptionProvider>
      </StoreProvider>
    </ApolloProvider>
  );
}

export default hot(module)(App);
