import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container, InputLabel } from "@material-ui/core";
import CreateAccountView from "./CreateAccountView";
import RevokeAccountView from "./RevokeAccountView";

import { useLocale } from "../../i18n";

const AccountView: React.FC<IStoreContainer> = observer(
  ({ accountStore, routerStore }) => {
    const { locale } = useLocale("account");

    return (
      <div>
        <button
          onClick={() => {
            routerStore.push("/account/create");
          }}
        >
          {locale("create key")}
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/revoke");
          }}
        >
          {locale("키 지우기")}
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/reset/input/private-key");
          }}
        >
          {locale("reset key")}
        </button>
        <button
          onClick={() => {
            routerStore.push("/");
          }}
        >
          {locale("back to the home")}
        </button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(AccountView);
