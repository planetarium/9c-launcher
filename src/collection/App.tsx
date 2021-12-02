import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { split, ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import React, { useState } from "react";
import "./App.scss";
import { getMainDefinition } from "apollo-utilities";
import { ApolloProvider } from "react-apollo";
import IntroFacade from "./pages/facade/IntroFacade";
import path from "path";
import { ipcRenderer } from "electron";

function getIsFileExsist() {
  var remote = require("electron").remote;
  var electronFs = remote.require("fs");
  const filePath = path.join(
    remote.app.getAppPath(),
    "monster-collection-intro"
  );
  console.log(`path: ${filePath}`);
  if (electronFs.existsSync(filePath)) {
    return true;
  } else {
    return false;
  }
}

function createFile() {
  var remote = require("electron").remote;
  var electronFs = remote.require("fs");
  const filePath = path.join(
    remote.app.getAppPath(),
    "monster-collection-intro"
  );
  electronFs.openSync(filePath, "w");
}

const isFileExsist = getIsFileExsist();

const App: React.FC = () => {
  const [agentAddress, setAgentAddress] = useState<string>("");
  const [client, setClient] = useState<ApolloClient<any>>();

  ipcRenderer.on("initialize collection window", (_, address, headlessUrl) => {
    console.log(
      `initialize collection window Main.tsx. address: ${address}, node: ${headlessUrl}`
    );
    setAgentAddress(address);

    const wsLink = new WebSocketLink({
      uri: `ws://${headlessUrl}/graphql`,
      options: {
        reconnect: true,
      },
    });

    const httpLink = createHttpLink({ uri: `http://${headlessUrl}/graphql` });

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

    setClient(client);
  });

  if (!client) return null;

  return (
    <ApolloProvider client={client}>
      <IntroFacade
        isFirst={isFileExsist}
        onCreateFile={createFile}
        agentAddress={agentAddress}
      />
    </ApolloProvider>
  );
};

export default App;
