import React from "react";
import { hot } from "react-hot-loader";
import { Route, Switch, Redirect } from "react-router";

import AccountView from "./views/account/AccountView";
import CopyCreatedPrivateKeyView from "./views/account/CopyCreatedPrivateKeyView";
import CreateAccountView from "./views/account/CreateAccountView";
import RevokeAccountView from "./views/account/RevokeAccountView";
import ReviewPrivateKeyView from "./views/account/reset/ReviewPrivateKeyView";
import ResetPasswordView from "./views/account/reset/ResetPasswordView";
import ConfigurationView from "./views/config/ConfigurationView";
import ErrorClearCacheView from "./views/error/ErrorClearCacheView";
import ErrorDiskSpaceView from "./views/error/ErrorDiskSpaceView";
import ErrorNoPermissionView from "./views/error/ErrorNoPermissionView";
import ErrorRelaunchView from "./views/error/ErrorRelaunchView";
import ErrorReinstallView from "./views/error/ErrorReinstallView";
import IndexView from "./views/index/IndexView";
import Layout2 from "./views/layout/Layout2";
import LobbyView from "./views/lobby/LobbyView";
import PreloadView from "./views/lobby/PreloadView";
import MiningView from "./views/login/MiningView";
import LoginView from "./views/login/LoginView";
import MainView from "./views/main/MainView";
import PreloadProgressView from "./views/preload/PreloadProgressView";

class Root extends React.Component {
  render() {
    return (
      <Layout2>
        <Switch>
          <Route exact path="/" component={IndexView} />
          <Route exact path="/main" component={MainView} />
          <Route exact path="/login" component={LoginView} />
          <Route exact path="/login/mining" component={MiningView} />
          <Route exact path="/lobby" component={LobbyView} />
          <Route exact path="/lobby/preload" component={PreloadView} />
          <Route
            exact
            path="/error/clear-cache"
            component={ErrorClearCacheView}
          />
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
            path="/account/reset/review-private-key"
            component={ReviewPrivateKeyView}
          />
          <Route
            exact
            path="/account/reset/reset-password"
            component={ResetPasswordView}
          />
          <Route exact path="/config" component={ConfigurationView} />
          <Redirect from="*" to="/" />
        </Switch>
        <PreloadProgressView />
      </Layout2>
    );
  }
}

export default hot(module)(Root);
