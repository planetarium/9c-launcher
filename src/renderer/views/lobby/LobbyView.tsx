import * as React from "react";
import { Button, Container, LinearProgress } from "@material-ui/core";
import mixpanel from "mixpanel-browser";
import { IStoreContainer } from "../../../interfaces/store";
import { inject, observer } from "mobx-react";

interface ILobbyViewProps extends IStoreContainer {
  onLaunch: () => void;
}

const LobbyView = observer((props: ILobbyViewProps) => {
  const { accountStore, gameStore } = props;

  return (
    <Container>
      <Button
        fullWidth
        disabled={gameStore.isGameStarted}
        variant="contained"
        color="primary"
        onClick={(event: React.MouseEvent) => {
          mixpanel.track("Launcher/Unity Player Start");
          gameStore.startGame(accountStore.privateKey);
          props.onLaunch();
          window.close();
        }}
      >
        {gameStore.isGameStarted ? "Now Running..." : "Start Game"}
      </Button>
    </Container>
  );
});

export default inject("accountStore", "gameStore")(LobbyView);
