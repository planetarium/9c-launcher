import { hot } from "react-hot-loader/root";
import * as React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import FooView from "./views/FooView";
import BarView from "./views/BarView";
import { Layout } from "./views/Layout";
import "./styles/main.scss";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Switch>
                    <Route path="/bar" component={BarView} />
                    <Route exact path="/" component={FooView} />
                    <Redirect from="*" to="/" />
                </Switch>
            </Layout>
        </BrowserRouter>
    );
}

export default hot(App);