import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router";
import { ProtectedPrivateKey } from "../interfaces/keystore";
import { useStore } from "./utils/useStore";

import LoginView from "./views/LoginView";
import WelcomeView from "./views/WelcomeView";
import RegisterView from "./views/RegisterView";
import LobbyView from "./views/LobbyView";
import MissingActivationView from "./views/MissingActivationView";
import ImportView from "./views/ImportView";
import RecoverView from "./views/RecoverView";
import ForgotPasswordView from "./views/ForgotPasswordView";
import ErrorView from "./views/ErrorView";
import RevokeView from "./views/RevokeView";

const Redirector = observer(() => {
  const account = useStore("account");
  const history = useHistory();
  const [protectedPrivateKeys, setProtectedPrivateKeys] = useState<
    ProtectedPrivateKey[] | null
  >(null);

  useEffect(() => {
    if (!protectedPrivateKeys) {
      ipcRenderer
        .invoke("get-protected-private-keys")
        .then(setProtectedPrivateKeys);
    } else if (protectedPrivateKeys.length < 1) {
      history.replace("/welcome");
    } else {
      protectedPrivateKeys.filter(Boolean).map(({ address }) => {
        !account.addresses.includes(address) && account.addAddress(address);
      });

      history.replace("/login");
    }
  });

  return null;
});

export default function Routes() {
  return (
    <Switch>
      <Route path="/login" component={LoginView} />
      <Route path="/welcome" component={WelcomeView} />
      <Route
        path="/register/missing-activation"
        component={MissingActivationView}
      />
      <Route path="/register" component={RegisterView} />
      <Route path="/lobby" component={LobbyView} />
      <Route path="/import" component={ImportView} />
      <Route path="/forgot" component={ForgotPasswordView} />
      <Route path="/recover" component={RecoverView} />
      <Route path="/error" component={ErrorView} />
      <Route path="/revoke" component={RevokeView} />
      <Route exact path="/" component={Redirector} />
      <Redirect from="*" to="/" />
    </Switch>
  );
}
