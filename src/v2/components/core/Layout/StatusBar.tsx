import React, { useEffect } from "react";
import { observer } from "mobx-react";
import ProgressBar from "../../ProgressBar";
import { styled } from "src/v2/stitches.config";
import { usePreload } from "src/v2/utils/usePreload";
import { useStore } from "src/v2/utils/useStore";
import Button from "../../ui/Button";
import { T } from "src/renderer/i18n";
import { useActivation } from "src/v2/utils/useActivation";
import { useHistory } from "react-router";

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
  const { message, isDone, progress, blockCount, error } = usePreload();
  const { account, game } = useStore();
  const { loading, activated } = useActivation();
  const history = useHistory();

  useEffect(() => {
    if (!error) return;
    history.push(`/error/${error}`);
  }, [error, history]);

  return (
    <StatusBarStyled>
      <StatusMessage>
        <span data-testid="status">{message}</span>
        {!!blockCount && <small>[{blockCount}]</small>}
        {isDone && account.isLogin && !game.isGameStarted && (
          <Button
            data-testid="play"
            variant="primary"
            disabled={loading || !activated}
            onClick={() =>
              account
                .getPrivateKeyAndForget()
                .then((privateKey) => game.startGame(privateKey))
            }
          >
            <T _str="Start" _tags="v2/start-game" />
          </Button>
        )}
      </StatusMessage>
      {!!progress && !isDone && !error && <ProgressBar percent={progress} />}
    </StatusBarStyled>
  );
}

export default observer(StatusBar);
