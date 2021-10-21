import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { split, ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import React, { useState } from "react";
import { HEADLESS_URL } from "../config";
import './App.scss';
import { getMainDefinition } from "apollo-utilities";
import Main from "./pages/main/main";
import { ApolloProvider } from "react-apollo";
import IntroFacade from "./pages/facade/IntroFacade";
import path from "path";
import { ipcRenderer } from "electron";

const wsLink = new WebSocketLink({
  uri: `ws://${HEADLESS_URL}/graphql`,
  options: {
    reconnect: true,
  },
});

const httpLink = createHttpLink({ uri: `http://${HEADLESS_URL}/graphql` });

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
  const [agentAddress, setAgentAddress] = useState<string>("");
  ipcRenderer.on("set miner address", (_, address) => {
    console.log("set miner address Main.tsx")
    setAgentAddress(address);
  })
  return (
  <ApolloProvider client={client}>
    <IntroFacade isFirst={isFileExsist} onCreateFile={createFile} agentAddress={agentAddress}/>
    </ApolloProvider>
  )
};

export default App;
