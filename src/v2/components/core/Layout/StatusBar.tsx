import React, { useEffect } from "react";
import { observer } from "mobx-react";
import ProgressBar from "./ProgressBar";
import { styled } from "src/v2/stitches.config";
import { usePreload } from "src/v2/utils/usePreload";
import { useStore } from "src/v2/utils/useStore";
import Button from "../../ui/Button";
import { T } from "src/renderer/i18n";

const StatusBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: 500,
});

const StatusMessage = styled("span", {
  marginBottom: 8,
  fontWeight: "bold",
  textShadow: "$text",
});

function StatusBar() {
  const [message, isDone, progress] = usePreload();
  const { account, game } = useStore();

  useEffect(() => {
    if (isDone && account.isLogin) {
      game.startGame(account.privateKey);
    }
  }, [isDone, account.isLogin]);

  return (
    <StatusBarStyled>
      <StatusMessage>
        {message}
        {isDone && account.isLogin && !game.isGameStarted && (
          <Button onClick={() => game.startGame(account.privateKey)}>
            <T _str="Start" _tags="v2/start-game" />
          </Button>
        )}
      </StatusMessage>
      {!!progress && <ProgressBar percent={progress} />}
    </StatusBarStyled>
  );
}

export default observer(StatusBar);
