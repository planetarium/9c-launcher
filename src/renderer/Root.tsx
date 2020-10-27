import { hot } from "react-hot-loader";
import React, { Suspense, lazy } from "react";
import { Route, Switch, Redirect } from "react-router";
import { Layout } from "./views/layout/Layout";
import "./styles/common.scss";
import { useLocale } from "./i18n";
import { Intro } from "src/interfaces/i18n";

const MainView = lazy(() => import("./views/main/MainView"));
const AccountView = lazy(() => import("./views/account/AccountView"));
const ConfigurationView = lazy(() =>
  import("./views/config/ConfigurationView")
);
const CreateAccountView = lazy(() =>
  import("./views/account/CreateAccountView")
);
const RevokeAccountView = lazy(() =>
  import("./views/account/RevokeAccountView")
);
const LobbyView = lazy(() => import("./views/lobby/LobbyView"));
const IntroView = lazy(() => import("./IntroView"));
const LoginView = lazy(() => import("./views/login/LoginView"));
const MiningView = lazy(() => import("./views/login/MiningView"));
const ErrorRelaunchView = lazy(() => import("./views/error/ErrorRelaunchView"));
const ErrorReinstallView = lazy(() =>
  import("./views/error/ErrorReinstallView")
);
const ErrorDiskSpaceView = lazy(() =>
  import("./views/error/ErrorDiskSpaceView")
);
const ErrorNoPermissionView = lazy(() =>
  import("./views/error/ErrorNoPermissionView")
);
const ReviewPrivateKeyView = lazy(() =>
  import("./views/account/reset/ReviewPrivateKeyView")
);
const ResetPasswordView = lazy(() =>
  import("./views/account/reset/ResetPasswordView")
);
const PreloadView = lazy(() => import("./views/lobby/PreloadView"));
const CopyCreatedPrivateKeyView = lazy(() =>
  import("./views/account/CopyCreatedPrivateKeyView")
);
const PreloadProgressView = lazy(() =>
  import("./views/preload/PreloadProgressView")
);

function Root() {
  const { locale } = useLocale<Intro>("intro");
  return (
    <Layout>
      <Suspense fallback={<div>{locale("불러오는 중...")}</div>}>
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
      </Suspense>
      <PreloadProgressView />
    </Layout>
  );
}

export default hot(module)(Root);
