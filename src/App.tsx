import { hot } from "react-hot-loader/root";
import * as React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { Layout } from "./views/Layout";
import "./styles/main.scss";
import MainView from './views/MainView';
import ApolloClient from "apollo-client"
import { ApolloLink, split } from 'apollo-link';
import { RetryLink } from 'apollo-link-retry';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloProvider } from 'react-apollo'
import { getMainDefinition } from 'apollo-utilities';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from "apollo-cache-inmemory";
import { GRAPHQL_ENTRYPOINT } from './constant';

const wsLink = new WebSocketLink({
    uri: `ws://localhost/graphql`,
    options: {
      reconnect: true
    }
});

const httpLink = createHttpLink({ uri: GRAPHQL_ENTRYPOINT });

const apiLink = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

const link = ApolloLink.from([
    new RetryLink(),
    apiLink,
]);

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
})
function App() {
    return (
        <ApolloProvider client={client}>
            <BrowserRouter>
                <Layout>
                    <Switch>
                        <Route exact path="/" component={MainView} />
                        <Redirect from="*" to="/" />
                    </Switch>
                </Layout>
            </BrowserRouter>
        </ApolloProvider>
    );
}

export default hot(App);
