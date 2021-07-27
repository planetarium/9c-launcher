import { ApolloProvider } from "@apollo/client";
import React from "react";
import { HashRouter as Router } from "react-router-dom";
import client from "./utils/apolloClient";

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>{/* Your app's code here */}</Router>
    </ApolloProvider>
  );
}

export default App;
