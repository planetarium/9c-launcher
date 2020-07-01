import { hot } from "react-hot-loader";
import * as React from "react";
import { Route, Switch, Redirect } from "react-router";
import { Layout } from "./views/layout/Layout";
import "./styles/common.scss";
import MainView from "./views/main/MainView";
import AccountView from "./views/account/AccountView";
import ConfigurationView from "./views/config/ConfigurationView";
import CreateAccountView from "./views/account/CreateAccountView";
import RevokeAccountView from "./views/account/RevokeAccountView";
import LobbyView from "./views/lobby/LobbyView";
import IntroView from "./IntroView";
import LoginView from "./views/login/LoginView";
import MiningView from "./views/login/MiningView";
import ErrorView from "./views/error/ErrorView";

class Root extends React.Component {
  render() {
    return (
      <Layout>
        <Switch>
          <Route exact path="/" component={IntroView} />
          <Route exact path="/main" component={MainView} />
          <Route exact path="/login" component={LoginView} />
          <Route exact path="/lobby/mining" component={MiningView} />
          <Route exact path="/lobby" component={LobbyView} />
          <Route exact path="/error" component={ErrorView} />
          <Route exact path="/account" component={AccountView} />
          <Route exact path="/account/create" component={CreateAccountView} />
          <Route exact path="/account/revoke" component={RevokeAccountView} />
          <Route exact path="/config" component={ConfigurationView} />
          <Redirect from="*" to="/" />
        </Switch>
      </Layout>
    );
  }
}

export default hot(module)(Root);
