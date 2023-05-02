import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import { ipcRenderer } from "electron";
import { app } from "@electron/remote";
import { RetryLink } from "@apollo/client/link/retry";
import { useEffect, useState } from "react";
import { NodeInfo } from "src/config";
import {
  GenesisHashDocument,
  GenesisHashQuery,
  PreloadEndedDocument,
  PreloadEndedQuery,
} from "src/generated/graphql";
import { captureException } from "@sentry/electron";

type Client = ApolloClient<NormalizedCacheObject>;

const onErrorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError) return;
  if (graphQLErrors)
    for (const error of graphQLErrors) {
      console.error("GraphQL Error by", operation.operationName, error);
      captureException(error);
    }
});

export default function useApolloClient(): Client | null {
  const [apolloClient, setApolloClient] = useState<Client | null>(null);

  useEffect(() => {
    (async () => {
      const node: NodeInfo = await ipcRenderer.invoke("get-node-info");
      const headlessUrl = `${node.host}:${node.graphqlPort}`;

      const wsLink = new WebSocketLink({
        uri: `ws://${headlessUrl}/graphql`,
        options: {
          reconnect: true,
        },
      });

      const httpLink = new HttpLink({
        uri: `http://${headlessUrl}/graphql`,
      });

      const splitLink = split(
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

      const client = new ApolloClient({
        link: ApolloLink.from([new RetryLink(), onErrorLink, splitLink]),
        cache: new InMemoryCache(),
        connectToDevTools: process.env.NODE_ENV !== "production",
      });

      client
        .query<GenesisHashQuery>({
          query: GenesisHashDocument,
        })
        .then((result) => {
          if (!result.data) return;
          ipcRenderer.send(
            "set-genesis-hash",
            result.data.nodeStatus.genesis.hash
          );
        });

      setApolloClient(client);
    })().catch(console.error);
  }, []);

  return apolloClient;
}
