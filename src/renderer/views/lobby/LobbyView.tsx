import * as React from "react";
import { LinearProgress } from "@material-ui/core";
import { IStoreContainer } from "../../../interfaces/store";
import { inject, observer } from "mobx-react";

const LobbyView = observer((props: IStoreContainer) => {
  const { accountStore, gameStore } = props;

  return (
    <div>
      <label>
        {gameStore.isGameStarted ? "Now Running..." : "Running the game"}
      </label>
      <br />
      <br />
      <button
        disabled={gameStore.isGameStarted}
        onClick={(event: React.MouseEvent) => {
          gameStore.startGame(accountStore.privateKey);
        }}
      >
        Start Game
      </button>
    </div>
  );
});

export default inject("accountStore", "gameStore")(LobbyView);
