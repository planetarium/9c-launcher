import * as React from "react";
import { observer, inject } from "mobx-react";
import LobbyView from "./LobbyView";
import LoginView from "./LoginView";
import { IStoreContainer } from "../../../interfaces/store";

const MainView = observer(
  ({ accountStore, routerStore, gameStore }: IStoreContainer) => {
    return (
      <div>
        {accountStore.isLogin ? (
          <LobbyView
            account={accountStore.selectedAddress}
            privateKey={accountStore.privateKey}
            isGameStarted={gameStore.isGameStarted}
            startGame={gameStore.startGame}
          />
        ) : (
          <LoginView
            accountStore={accountStore}
            routerStore={routerStore}
            gameStore={gameStore}
          />
        )}
      </div>
    );
  }
);

export default inject("accountStore", "routerStore", "gameStore")(MainView);
