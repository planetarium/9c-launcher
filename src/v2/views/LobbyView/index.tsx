import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import { useStore } from "src/v2/utils/useStore";
import { useActivation } from "src/v2/utils/useActivation";
import { useHistory } from "react-router";

function useFirstRender() {
  const ref = useRef(true);
  const firstRender = ref.current;
  ref.current = false;
  return firstRender;
}

function LobbyView() {
  const account = useStore("account");
  const activated = useActivation(account.activationKey);
  const history = useHistory();
  const firstRender = useFirstRender();

  useEffect(() => {
    if (firstRender || activated || account.activationKey) return;
    history.push("/register/missing-activation");
  }, [activated, account.activationKey]);

  return <Layout />;
}

export default observer(LobbyView);
