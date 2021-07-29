import { ApolloProvider } from "@apollo/client";
import React from "react";
import { HashRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import client from "./utils/apolloClient";
import APVSubscriptionProvider from "./utils/APVSubscriptionProvider";

function App() {
  return (
    <ApolloProvider client={client}>
      <APVSubscriptionProvider>
        <Router>
          <Routes />
        </Router>
      </APVSubscriptionProvider>
    </ApolloProvider>
  );
}

export default App;
