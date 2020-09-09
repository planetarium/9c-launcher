import { hot } from "react-hot-loader";
import React from "react";
import { Route, Switch, Redirect } from "react-router";
import Layout from "./views/layout/Layout";
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
import ErrorRelaunchView from "./views/error/ErrorRelaunchView";
import ErrorReinstallView from "./views/error/ErrorReinstallView";
import ErrorDiskSpaceView from "./views/error/ErrorDiskSpaceView";
import ErrorNoPermissionView from "./views/error/ErrorNoPermissionView";
import InputPrivateKeyView from "./views/account/reset/InputPrivateKeyView";
import RegisterPrivateKeyView from "./views/account/reset/RegisterPrivateKeyView";
import PreloadView from "./views/lobby/PreloadView";
import CopyCreatedPrivateKeyView from "./views/account/CopyCreatedPrivateKeyView";
import PreloadProgressView from "./views/preload/PreloadProgressView";

class Root extends React.Component {
  render() {
    return (
      <Layout>
        <Switch>
          <Route exact path="/" component={IntroView} />
          <Route exact path="/main" component={MainView} />
          <Route exact path="/login" component={LoginView} />
          <Route exact path="/login/mining" component={MiningView} />
          <Route exact path="/lobby" component={LobbyView} />
          <Route exact path="/lobby/preload" component={PreloadView} />
          <Route exact path="/error/relaunch" component={ErrorRelaunchView} />
          <Route exact path="/error/reinstall" component={ErrorReinstallView} />
          <Route
            exact
            path="/error/no-permission"
            component={ErrorNoPermissionView}
          />
          <Route
            exact
            path="/error/disk-space"
            component={ErrorDiskSpaceView}
          />
          <Route exact path="/account" component={AccountView} />
          <Route exact path="/account/create" component={CreateAccountView} />
          <Route
            exact
            path="/account/create/copy"
            component={CopyCreatedPrivateKeyView}
          />
          <Route exact path="/account/revoke" component={RevokeAccountView} />
          <Route
            exact
            path="/account/reset/input/private-key"
            component={InputPrivateKeyView}
          />
          <Route
            exact
            path="/account/reset/input/passphrase"
            component={RegisterPrivateKeyView}
          />
          <Route exact path="/config" component={ConfigurationView} />
          <Redirect from="*" to="/" />
        </Switch>
        <PreloadProgressView />
      </Layout>
    );
  }
}

export default hot(module)(Root);
