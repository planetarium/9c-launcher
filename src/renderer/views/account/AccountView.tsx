import * as React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container, InputLabel } from "@material-ui/core";
import CreateAccountView from "./CreateAccountView";
import RevokeAccountView from "./RevokeAccountView";

import { useLocale } from "../../i18n";

const AccountView: React.FC<IStoreContainer> = observer(
  ({ accountStore, routerStore }: IStoreContainer) => {
    const locale = useLocale("account");

    return (
      <div>
        <button
          onClick={() => {
            routerStore.push("/account/create");
          }}
        >
          {locale("create")}
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/revoke");
          }}
        >
          {locale("revoke")}
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/reset/input/private-key");
          }}
        >
          {locale("reset")}
        </button>
        <button
          onClick={() => {
            routerStore.push("/");
          }}
        >
          {locale("back")}
        </button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(AccountView);
