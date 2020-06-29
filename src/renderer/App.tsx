import { hot } from "react-hot-loader/root";
import * as React from "react";
import { Router, Route, Switch, Redirect } from "react-router";
import { createBrowserHistory } from "history";
import { Layout } from "./views/layout/Layout";
import "./styles/common.scss";
import MainView from "./views/main/MainView";
import ApolloClient from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { RetryLink } from "apollo-link-retry";
import { WebSocketLink } from "apollo-link-ws";
import { ApolloProvider } from "react-apollo";
import { getMainDefinition } from "apollo-utilities";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { Provider } from "mobx-react";
import AccountStore from "./stores/account";
import { IStoreContainer } from "../interfaces/store";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import AccountView from "./views/account/AccountView";
import { LOCAL_SERVER_URL } from "../config";
import ConfigurationView from "./views/config/ConfigurationView";
import GameStore from "./stores/game";

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

const Store: IStoreContainer = {
  accountStore: new AccountStore(),
  routerStore: new RouterStore(),
  gameStore: new GameStore(),
};

const history = syncHistoryWithStore(createBrowserHistory(), Store.routerStore);

function App() {
  return (
    <ApolloProvider client={client}>
      <Router history={history}>
        <Provider {...Store}>
          <Layout>
            <Switch>
              <Route exact path="/" component={MainView} />
              <Route exact path="/account" component={AccountView} />
              <Route exact path="/config" component={ConfigurationView} />
              <Redirect from="*" to="/" />
            </Switch>
          </Layout>
        </Provider>
      </Router>
    </ApolloProvider>
  );
}

export default hot(App);
