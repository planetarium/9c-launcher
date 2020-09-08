import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../generated/graphql";

import { useLocale } from "./i18n";

const IntroView = observer(({ accountStore, routerStore }: IStoreContainer) => {
  const { loading, data } = useProtectedPrivateKeysQuery({
    fetchPolicy: "no-cache",
  });

  const { locale } = useLocale("intro");

  useEffect(() => {
    if (!loading && data?.keyStore?.protectedPrivateKeys !== undefined) {
      if (data?.keyStore?.protectedPrivateKeys.length < 1) {
        routerStore.push("/main");
      } else {
        const addresses = data.keyStore.protectedPrivateKeys.map(
          (value) => value?.address
        );
        addresses.forEach((value) => {
          if (accountStore.addresses.includes(value)) {
            accountStore.addAddress(value);
          }
        });

        routerStore.push("/login");
      }
    }
  }, [loading, data]);

  return <div>{locale("now loading...")}</div>;
});

export default inject("accountStore", "routerStore")(IntroView);
