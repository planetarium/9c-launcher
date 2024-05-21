import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import { useCheckContract } from "src/utils/useCheckContract";
import { useStore } from "src/utils/useStore";

function LobbyView() {
  const { account, game, planetary } = useStore();
  const { loading, error, approved, requested, stopPolling } =
    useCheckContract(true);
  const history = useHistory();
  const { search } = useLocation();
  localStorage.setItem("country", game._country);

  useEffect(() => {
    if (loading || approved || search !== "") return;
    stopPolling();
    history.push(!requested ? "/register/getPatron" : "/register/pledgeWait");
  }, [history, loading, approved, requested, planetary.planet]);

  useEffect(() => {
    if (account.loginSession && approved && !game.isGameBlocked) {
      stopPolling();
      const privateKeyBytes = account.loginSession.privateKey.toBytes();
      game.startGame(
        Buffer.from(privateKeyBytes).toString("hex"),
        planetary.getHost(),
        planetary.getRpcPort(),
        planetary.planet.id,
      );
    }
  }, [
    account.loginSession,
    approved,
    game,
    planetary.planet,
    game.isGameBlocked,
  ]);

  useEffect(() => {
    if (error) history.push("/error/relaunch");
  }, [history, error]);

  return <Layout />;
}

export default observer(LobbyView);
