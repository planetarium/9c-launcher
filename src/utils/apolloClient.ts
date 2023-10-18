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
import { RetryLink } from "@apollo/client/link/retry";
import { GenesisHashDocument, GenesisHashQuery } from "src/generated/graphql";
import { useStore } from "./useStore";
import { NodeInfo } from "src/config";

type Client = ApolloClient<NormalizedCacheObject>;

const onErrorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError) return;
  if (graphQLErrors)
    for (const error of graphQLErrors) {
      console.error("GraphQL Error by", operation.operationName, error);
    }
});

export default function useApolloClient(): Client | null {
  const { planetary } = useStore();
  const node = planetary.node;
  if (node === null) {
    return null;
  }

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
    httpLink,
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
      ipcRenderer.send("set-genesis-hash", result.data.nodeStatus.genesis.hash);
    });
  return client;
}
