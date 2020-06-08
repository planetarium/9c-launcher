import { hot } from "react-hot-loader/root";
import * as React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { Layout } from "./views/Layout";
import "./styles/main.scss";
import MainView from './views/MainView';
import ApolloClient from "apollo-client"
import { ApolloLink } from 'apollo-link';
import { RetryLink } from 'apollo-link-retry';
import { ApolloProvider } from 'react-apollo'
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from "apollo-cache-inmemory";

const link = ApolloLink.from([
    new RetryLink(),
    createHttpLink({ uri: "http://localhost/graphql" })
  ]);

const client = new ApolloClient({
    link: createHttpLink({ uri: "http://localhost/graphql" }),
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