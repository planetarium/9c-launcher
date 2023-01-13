import React, { useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react";
import Layout from "src/renderer/components/core/Layout";
import { useStore } from "src/utils/useStore";
import { useActivation } from "src/utils/useActivation";
import { useHistory } from "react-router";
import OnboardingOverlay from "src/renderer/views/OnboardingOverlay";
import { usePreload } from "src/utils/usePreload";

const isFirst = (state: string): boolean => {
  return state.includes("first");
};

function LobbyView() {
  const { account, game } = useStore();
  const { isDone } = usePreload();
  const { loading, activated, error } = useActivation(account.activationKey);
  const history = useHistory();
  const onboardingRequired = useMemo(
    () => isFirst(history.location.search),
    [history.location]
  );
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    if (loading || activated || account.activationKey) return;
    history.push("/register/missing-activation");
  }, [loading, activated, account.activationKey]);

  useEffect(() => {
    if (isDone && account.isLogin && activated) {
      account
        .getPrivateKeyAndForget()
        .then((privateKey) => game.startGame(privateKey));
    }
  }, [isDone, account.isLogin, activated]);

  useEffect(() => {
    if (error) history.push("/error/relaunch");
  }, [error]);

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
