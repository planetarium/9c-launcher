import React, { useEffect } from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import { useStore } from "src/v2/utils/useStore";
import { useActivation } from "src/v2/utils/useActivation";

function LobbyView() {
  const account = useStore("account");
  const activated = useActivation(account.activationKey);

  useEffect(() => {
    if (activated || account.activationKey) return;
    // TODO: show input for activation key
  });

  return <Layout />;
}

export default observer(LobbyView);
