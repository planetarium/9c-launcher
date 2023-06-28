import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import { useCheckContract } from "src/utils/useCheckContract";
import { useStore } from "src/utils/useStore";

function LobbyView() {
  const { account, game } = useStore();
  const { loading, error, approved, requested, stopPolling } =
    useCheckContract(true);
  const history = useHistory();
  const { search } = useLocation();

  useEffect(() => {
    if (loading || approved || search !== "") return;
    stopPolling();
    history.push(!requested ? "/register/getPatron" : "/register/pledgeWait");
  }, [history, loading, approved, requested]);

  useEffect(() => {
    if (account.loginSession && approved) {
      stopPolling();
      const privateKeyBytes = account.loginSession.privateKey.toBytes();
      game.startGame(Buffer.from(privateKeyBytes).toString("hex"));
    }
  }, [account.loginSession, approved, game]);

  useEffect(() => {
    if (error) history.push("/error/relaunch");
  }, [history, error]);

  return <Layout />;
}

export default observer(LobbyView);
