import { observer } from "mobx-react";
import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import OnboardingOverlay from "src/renderer/views/OnboardingOverlay";
import { useActivationStatus } from "src/utils/useActivationStatus";
import { useStore } from "src/utils/useStore";

const isFirst = (state: string): boolean => {
  return state.includes("first");
};

function LobbyView() {
  const { account, game } = useStore();
  const { loading, activated, error } = useActivationStatus();
  const history = useHistory();
  const onboardingRequired = useMemo(
    () => isFirst(history.location.search),
    [history.location]
  );
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    if (loading || activated || account.activationKey) return;
    history.push("/register/missing-activation");
  }, [history, loading, activated, account.activationKey]);

  useEffect(() => {
    if (account.loginSession && activated) {
      game.startGame(account.loginSession.privateKey);
    }
  }, [account.loginSession, activated, game]);

  useEffect(() => {
    if (error) history.push("/error/relaunch");
  }, [history, error]);

  return (
    <>
      <Layout />
      <OnboardingOverlay
        // isOpen={onboardingRequired && showOnboarding}
        isOpen={false}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
}

export default observer(LobbyView);
