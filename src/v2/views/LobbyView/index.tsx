import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import { useStore } from "src/v2/utils/useStore";
import { useActivation } from "src/v2/utils/useActivation";
import { useHistory } from "react-router";
import OnboardingOverlay from "src/v2/views/OnboardingOverlay";

const isStateValid = (state: unknown): state is { first: boolean } => {
  return typeof state === "object" && state != null && "first" in state;
};

function LobbyView() {
  const account = useStore("account");
  const { loading, activated } = useActivation(account.activationKey);
  const history = useHistory();
  const [showOnboarding, setShowOnboarding] = useState(
    () => isStateValid(history.location.state) && history.location.state.first
  );

  useEffect(() => {
    if (loading || activated || account.activationKey) return;
    history.push("/register/missing-activation");
  }, [activated, account.activationKey]);

  return (
    <>
      <Layout />
      <OnboardingOverlay
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
}

export default observer(LobbyView);
