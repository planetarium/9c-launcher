import * as React from "react";
import { observer, inject } from "mobx-react";
import LobbyView from "../lobby/LobbyView";
import LoginView from "./LoginView";
import { IStoreContainer } from "../../../interfaces/store";

const MainView = observer(
  ({ accountStore, routerStore, gameStore }: IStoreContainer) => {
    return (
      <div>
        <LoginView
          accountStore={accountStore}
          routerStore={routerStore}
          gameStore={gameStore}
        />
      </div>
    );
  }
);

export default inject("accountStore", "routerStore", "gameStore")(MainView);
