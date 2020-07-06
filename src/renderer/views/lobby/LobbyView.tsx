import * as React from "react";
import { Button, Grid, LinearProgress } from "@material-ui/core";
import { IStoreContainer } from "../../../interfaces/store";
import { inject, observer } from "mobx-react";

const LobbyView = observer((props: IStoreContainer) => {
  const { accountStore, gameStore } = props;

  return (
    <Grid container>
      <label>
        {gameStore.isGameStarted ? "Now Running..." : "Running the game"}
      </label>
      <Button
        fullWidth
        disabled={gameStore.isGameStarted}
        onClick={(event: React.MouseEvent) => {
          gameStore.startGame(accountStore.privateKey);
        }}
      >
        Start Game
      </Button>
    </Grid>
  );
});

export default inject("accountStore", "gameStore")(LobbyView);
