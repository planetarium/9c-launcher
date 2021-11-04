import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  HttpLink,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { LOCAL_SERVER_URL } from "../../config";
import { RetryLink } from "@apollo/client/link/retry";

const wsLink = new WebSocketLink({
  uri: `ws://${LOCAL_SERVER_URL}/graphql`,
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({ uri: `http://${LOCAL_SERVER_URL}/graphql` });

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

const link = ApolloLink.from([new RetryLink(), splitLink]);

export default new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
