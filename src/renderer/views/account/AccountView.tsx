import * as React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container, InputLabel } from "@material-ui/core";
import CreateAccountView from "./CreateAccountView";
import RevokeAccountView from "./RevokeAccountView";

const AccountView: React.FC<IStoreContainer> = observer(
  ({ accountStore, routerStore }: IStoreContainer) => {
    return (
      <div>
        <button
          onClick={() => {
            routerStore.push("/account/create");
          }}
        >
          create key
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/revoke");
          }}
        >
          revoke key
        </button>
        <button
          onClick={() => {
            routerStore.push("/");
          }}
        >
          back to the home
        </button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(AccountView);
