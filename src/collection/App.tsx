import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { split, ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import React, { useState } from "react";
import { LOCAL_SERVER_URL } from "../config";
import './App.scss';
import { getMainDefinition } from "apollo-utilities";
import Main from "./pages/main/main";
import { ApolloProvider } from "react-apollo";


const wsLink = new WebSocketLink({
  uri: `ws://${LOCAL_SERVER_URL}/graphql`,
  options: {
    reconnect: true,
  },
});

const httpLink = createHttpLink({ uri: `http://${LOCAL_SERVER_URL}/graphql` });

const apiLink = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const link = ApolloLink.from([new RetryLink(), apiLink]);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});

const App: React.FC = () => {
  return (
  <ApolloProvider client={client}>
    <Main />
    </ApolloProvider>
  )
};

export default App;
