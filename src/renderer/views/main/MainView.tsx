import * as React from "react";
import { observer, inject } from "mobx-react";
import LobbyView from "../lobby/LobbyView";
import LoginView from "../login/LoginView";
import { IStoreContainer } from "../../../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import { Button } from "@material-ui/core";

const MainView = observer(
  ({ accountStore, routerStore, gameStore }: IStoreContainer) => {
    return (
      <div>
        welcome to nine chronicles!
        <br />
        <Button
          onClick={() => routerStore.push("/account/create")}
          variant="contained"
          color="primary"
        >
          Create Account
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore", "gameStore")(MainView);
