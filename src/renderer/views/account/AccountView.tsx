import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container, InputLabel } from "@material-ui/core";
import CreateAccountView from "./CreateAccountView";
import RevokeAccountView from "./RevokeAccountView";

import { useLocale } from "../../i18n";
import { Account } from "../../../interfaces/i18n";

const AccountView: React.FC<IStoreContainer> = observer(
  ({ accountStore, routerStore }) => {
    const { locale } = useLocale<Account>("account");
    return (
      <div>
        <button
          onClick={() => {
            routerStore.push("/account/create");
          }}
        >
          {locale("키 생성하기")}
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
          {locale("키 초기화하기")}
        </button>
        <button
          onClick={() => {
            routerStore.push("/");
          }}
        >
          {locale("홈으로 돌아가기")}
        </button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(AccountView);
