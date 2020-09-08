import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";

import { useLocale } from "../../i18n";

const AccountView: React.FC<IStoreContainer> = observer(({ routerStore }) => {
  const { locale } = useLocale("account");

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          routerStore.push("/account/create");
        }}
      >
        {locale("create key")}
      </button>
      <button
        type="button"
        onClick={() => {
          routerStore.push("/account/revoke");
        }}
      >
        {locale("revoke key")}
      </button>
      <button
        type="button"
        onClick={() => {
          routerStore.push("/account/reset/input/private-key");
        }}
      >
        {locale("reset key")}
      </button>
      <button
        type="button"
        onClick={() => {
          routerStore.push("/");
        }}
      >
        {locale("back to the home")}
      </button>
    </div>
  );
});

export default inject("routerStore")(AccountView);
