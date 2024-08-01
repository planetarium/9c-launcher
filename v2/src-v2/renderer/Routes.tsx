import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useActor } from "@xstate/react";
import { Redirect, Route, Switch, useHistory } from "react-router";
import { useStore } from "src/utils/useStore";
import ErrorView from "./views/ErrorView";
import ForgotPasswordView from "./views/ForgotPasswordView";
import ImportView from "./views/ImportView";
import LobbyView from "./views/LobbyView";
import LoginView from "./views/LoginView";
import RecoverView from "./views/RecoverView";
import ConfirmUpdateView from "./views/ConfirmUpdateView";
import {
  PledgeFailView,
  PledgeSuccessView,
  PledgeWaitView,
  CreateKeyView,
  GetPatronView,
} from "./views/RegisterView";
import RevokeView from "./views/RevokeView";
import WelcomeView from "./views/WelcomeView";
import { updateService } from "src/renderer/machines/updateMachine";

const Redirector = observer(() => {
  const account = useStore("account");
  const history = useHistory();

  useEffect(() => {
    if (account.addresses.length > 0) {
      history.replace("/login");
    } else {
      history.replace("/welcome");
    }
  });
  return null;
});

export default function Routes() {
  const history = useHistory();

  const [state] = useActor(updateService);

  useEffect(() => {
    if (state.matches("error") && state.context.data?.url) {
      history.push(`/error/${state.context.data.url}`);
    }
  }, [history, state]);

  return (
    <Switch>
      <Route path="/login" component={LoginView} />
      <Route path="/welcome" component={WelcomeView} />
      <Route path="/confirm-update" component={ConfirmUpdateView} />
      <Route path="/register/createKey" component={CreateKeyView} />
      <Route path="/register/getPatron" component={GetPatronView} />
      <Route path="/register/pledgeWait" component={PledgeWaitView} />
      <Route path="/register/pledgeSuccess" component={PledgeSuccessView} />
      <Route path="/register/pledgeFail" component={PledgeFailView} />
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
