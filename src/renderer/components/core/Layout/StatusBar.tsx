import { observer } from "mobx-react";
import React from "react";
import { T } from "src/renderer/i18n";
import { styled } from "src/renderer/stitches.config";
import { useActivationStatus } from "src/utils/useActivationStatus";
import { useIsHeadlessAvailable } from "src/utils/useIsHeadlessAvailable";
import { useStore } from "src/utils/useStore";
import Button from "../../ui/Button";
import { useCheckContract } from "src/utils/useCheckContract";

const StatusBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: 450,
});

const StatusMessage = styled("span", {
  marginBottom: 8,
  fontWeight: "bold",
  textShadow: "$text",
  lineHeight: 1,
  "& > * + *": {
    marginLeft: 8,
  },
});

function StatusBar() {
  const isAvailable = useIsHeadlessAvailable();
  const { account: accountStore, game } = useStore();
  const { loading: activationLoad, activated } = useActivationStatus();
  const { loading: contractLoad, contracted } = useCheckContract();

  const loginSession = accountStore.loginSession;

  return (
    <StatusBarStyled>
      <StatusMessage>
        {isAvailable && loginSession && !game.isGameStarted ? (
          <Button
            data-testid="play"
            variant="primary"
            disabled={
              activationLoad || contractLoad || !activated || !contracted
            }
            onClick={() => {
              const privateKeyBytes = loginSession.privateKey.toBytes();
              return game.startGame(
                Buffer.from(privateKeyBytes).toString("hex")
              );
            }}
          >
            <T _str="Start" _tags="v2/start-game" />
          </Button>
        ) : (
          <span data-testid="status">
            {!loginSession ? "Done" : "Loading..."}
          </span>
        )}
      </StatusMessage>
    </StatusBarStyled>
  );
}

export default observer(StatusBar);
