import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import { useCheckContract } from "src/utils/useCheckContract";
import { useStore } from "src/utils/useStore";

function LobbyView() {
  const { account, game } = useStore();
  const { loading, contracted, error } = useCheckContract();
  const history = useHistory();

  useEffect(() => {
    if (loading || contracted || account.activationKey) return;
    history.push("/register/activationKey");
  }, [history, loading, contracted, account.activationKey]);

  useEffect(() => {
    if (account.loginSession && contracted) {
      const privateKeyBytes = account.loginSession.privateKey.toBytes();
      game.startGame(Buffer.from(privateKeyBytes).toString("hex"));
    }
  }, [account.loginSession, contracted, game]);

  useEffect(() => {
    if (error) history.push("/error/relaunch");
  }, [history, error]);

  return <Layout />;
}

export default observer(LobbyView);
