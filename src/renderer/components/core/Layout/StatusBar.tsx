import { observer } from "mobx-react";
import React from "react";
import { T } from "src/renderer/i18n";
import { styled } from "src/renderer/stitches.config";
import { useIsHeadlessAvailable } from "src/utils/useIsHeadlessAvailable";
import { useStore } from "src/utils/useStore";
import Button from "../../ui/Button";
import { useCheckContractedQuery } from "src/generated/graphql";

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
  const { account, game } = useStore();
  const { loading, data } = useCheckContractedQuery({
    variables: { agentAddress: account.loginSession?.address.toHex() },
  });

  const loginSession = account.loginSession;

  return (
    <StatusBarStyled>
      <StatusMessage>
        {isAvailable && loginSession && !game.isGameStarted ? (
          <Button
            data-testid="play"
            variant="primary"
            disabled={loading || !data?.stateQuery.contracted.contracted}
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
