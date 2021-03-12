import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../generated/graphql";

import { useLocale } from "./i18n";
import { Intro } from "../interfaces/i18n";
import { ipcRenderer } from "electron";
import { ProtectedPrivateKey } from "src/main/key-store";

const IntroView = observer(({ accountStore, routerStore }: IStoreContainer) => {
  const protectedPrivateKeys: ProtectedPrivateKey[] = ipcRenderer.sendSync(
    "get-protected-private-keys"
  );
  const { locale } = useLocale<Intro>("intro");

  useEffect(() => {
    if (protectedPrivateKeys.length < 1) {
      routerStore.push("/main");
    } else {
      const addresses = protectedPrivateKeys.map((value) => value?.address);
      addresses.map((value) => {
        accountStore.addresses.includes(value)
          ? null
          : accountStore.addAddress(value);
      });

      routerStore.push("/login");
    }
  }, [protectedPrivateKeys]);

  return <div>{locale("불러오는 중...")}</div>;
});

export default inject("accountStore", "routerStore")(IntroView);
