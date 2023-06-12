import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import { useCheckContract } from "src/utils/useCheckContract";
import { useStore } from "src/utils/useStore";

function LobbyView() {
  const { account, game } = useStore();
  const { loading, error, approved, requested } = useCheckContract();
  const history = useHistory();

  useEffect(() => {
    if (!approved) {
      if (!requested) {
        history.push("/register/getPatron");
      } else {
        history.push("/register/pledgeWait");
      }
    }
  }, [history, loading, approved, requested]);

  useEffect(() => {
    if (account.loginSession && approved) {
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
