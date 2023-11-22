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
  if (!planetary.node) {
    return null;
  }
  const host = planetary.getHost();

  const wsLink = new WebSocketLink({
    uri: `ws://${host}/graphql`,
    options: {
      reconnect: true,
    },
  });

  const httpLink = new HttpLink({
    uri: planetary.node!.gqlUrl,
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
