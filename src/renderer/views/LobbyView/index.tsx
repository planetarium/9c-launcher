import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import { useActivationStatus } from "src/utils/useActivationStatus";
import { useStore } from "src/utils/useStore";

function LobbyView() {
  const { account, game } = useStore();
  const { loading, activated, error } = useActivationStatus();
  const history = useHistory();

  useEffect(() => {
    if (loading || activated || account.activationKey) return;
    history.push("/register/activationKey");
  }, [history, loading, activated, account.activationKey]);

  useEffect(() => {
    if (account.loginSession && activated) {
      game.startGame(account.loginSession.privateKey);
    }
  }, [account.loginSession, activated, game]);

  useEffect(() => {
    if (error) history.push("/error/relaunch");
  }, [history, error]);

  return <Layout />;
}

export default observer(LobbyView);
