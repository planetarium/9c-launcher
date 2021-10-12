import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { split, ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import React, { useState } from "react";
import { LOCAL_SERVER_URL, REMOTE_HEADLESS_URL, get } from "../config";
import './App.scss';
import { getMainDefinition } from "apollo-utilities";
import Main from "./pages/main/main";
import { ApolloProvider } from "react-apollo";
import IntroFacade from "./pages/facade/IntroFacade";
import path from "path";


const baseUrl = get("UseRemoteHeadless") ? REMOTE_HEADLESS_URL : LOCAL_SERVER_URL;
const wsLink = new WebSocketLink({
  uri: `ws://${LOCAL_SERVER_URL}/graphql`,
  options: {
    reconnect: true,
  },
});

const httpLink = createHttpLink({ uri: `http://${baseUrl}/graphql` });

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

function getIsFileExsist() {
  var remote = require('electron').remote;
  var electronFs = remote.require('fs');
  const filePath = path.join(remote.app.getAppPath(), "monster-collection-intro");
  console.log(`path: ${filePath}`)
  if(electronFs.existsSync(filePath)) {
    return true;
  } else {
    return false;
  }
}

function createFile() {
  var remote = require('electron').remote;
  var electronFs = remote.require('fs');
  const filePath = path.join(remote.app.getAppPath(), "monster-collection-intro");
  electronFs.openSync(filePath, 'w');
}

const isFileExsist = getIsFileExsist();

const link = ApolloLink.from([new RetryLink(), apiLink]);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});

const App: React.FC = () => {
  return (
  <ApolloProvider client={client}>
    <IntroFacade isFirst={isFileExsist} onCreateFile={createFile} />
    </ApolloProvider>
  )
};

export default App;
