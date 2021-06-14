import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container, InputLabel } from "@material-ui/core";
import CreateAccountView from "./CreateAccountView";
import RevokeAccountView from "./RevokeAccountView";

import { T } from "@transifex/react";
import { Account } from "../../../interfaces/i18n";

const AccountView: React.FC<IStoreContainer> = observer(
  ({ accountStore, routerStore }) => {
    return (
      <div>
        <button
          onClick={() => {
            routerStore.push("/account/create");
          }}
        >
          <T _str="create key" _tags="account" />
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/revoke");
          }}
        >
          <T _str="revoke key" _tags="account" />
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/reset/review-private-key");
          }}
        >
          <T _str="reset key" _tags="account" />
        </button>
        <button
          onClick={() => {
            routerStore.push("/");
          }}
        >
          <T _str="back to the home" _tags="account" />
        </button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(AccountView);
