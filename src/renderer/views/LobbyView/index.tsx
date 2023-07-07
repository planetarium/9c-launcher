import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import { useCheckContract } from "src/utils/useCheckContract";
import { useStore } from "src/utils/useStore";
import _refiner from "refiner-js";

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
      _refiner('showForm', 'dc6a2a00-1404-11ee-a712-3f6875bb6fc0', true);

    }
  }, [account.loginSession, approved, game]);

  useEffect(() => {
    if (error) history.push("/error/relaunch");
  }, [history, error]);

  return <Layout />;
}

export default observer(LobbyView);
