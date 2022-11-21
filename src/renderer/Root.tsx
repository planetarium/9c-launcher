import React from "react";
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
import ReviewPrivateKeyView from "./views/account/reset/ReviewPrivateKeyView";
import ResetPasswordView from "./views/account/reset/ResetPasswordView";
import PreloadView from "./views/lobby/PreloadView";
import CopyCreatedPrivateKeyView from "./views/account/CopyCreatedPrivateKeyView";
import PreloadProgressView from "./views/preload/PreloadProgressView";
import ErrorClearCacheView from "./views/error/ErrorClearCacheView";
import ErrorDiskSpaceView from "./views/error/ErrorDiskSpaceView";
import ErrorDownloadBinaryFailedView from "./views/error/ErrorDownloadBinaryFailedView";
import ErrorDownloadSnapshotFailedView from "./views/error/ErrorDownloadSnapshotFailedView";
import ErrorDownloadSnapshotMetadataFailedView from "./views/error/ErrorDownloadSnapshotMetadataFailedView";
import ErrorNoPermissionView from "./views/error/ErrorNoPermissionView";
import ErrorReinstallView from "./views/error/ErrorReinstallView";
import ErrorRelaunchView from "./views/error/ErrorRelaunchView";

class Root extends React.Component {
  render() {
    return (
      <Layout>
        <Switch>
          <Route exact path="/" component={IntroView} />
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
          <Route
            exact
            path="/error/clear-cache"
            component={ErrorClearCacheView}
          />
          <Route
            exact
            path="/error/disk-space"
            component={ErrorDiskSpaceView}
          />
          <Route
            exact
            path="/error/download-binary-failed-error"
            component={ErrorDownloadBinaryFailedView}
          />
          <Route
            exact
            path="/error/download-snapshot-failed-error"
            component={ErrorDownloadSnapshotFailedView}
          />
          <Route
            exact
            path="/error/download-snapshot-metadata-failed-error"
            component={ErrorDownloadSnapshotMetadataFailedView}
          />
          <Route
            exact
            path="/error/no-permission"
            component={ErrorNoPermissionView}
          />
          <Route exact path="/error/reinstall" component={ErrorReinstallView} />
          <Route exact path="/error/relaunch" component={ErrorRelaunchView} />
          <Route exact path="/lobby" component={LobbyView} />
          <Route exact path="/lobby/preload" component={PreloadView} />
          <Route exact path="/login" component={LoginView} />
          <Route exact path="/main" component={MainView} />
          <Redirect from="*" to="/" />
        </Switch>
        <PreloadProgressView />
      </Layout>
    );
  }
}

export default Root;
