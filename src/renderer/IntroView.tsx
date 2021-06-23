import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../generated/graphql";

import { T } from "@transifex/react";
import { ipcRenderer } from "electron";
import { ProtectedPrivateKey } from "src/main/headless/key-store";

const IntroView = observer(({ accountStore, routerStore }: IStoreContainer) => {
  const protectedPrivateKeys: ProtectedPrivateKey[] = ipcRenderer.sendSync(
    "get-protected-private-keys"
  );

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

  return <div><T _str="Now Loading..." _tags="intro" /></div>;
});

export default inject("accountStore", "routerStore")(IntroView);
