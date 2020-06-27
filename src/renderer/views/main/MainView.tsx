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
            accountStore={accountStore}
            routerStore={routerStore}
            gameStore={gameStore}
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
