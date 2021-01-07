import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../generated/graphql";

import { useLocale } from "./i18n";
import { Intro } from "../interfaces/i18n";

const IntroView = observer(({ accountStore, routerStore }: IStoreContainer) => {
  const { loading, error, data, refetch } = useProtectedPrivateKeysQuery({
    fetchPolicy: "no-cache",
  });

  const { locale } = useLocale<Intro>("intro");

  useEffect(() => {
    if (
      error?.graphQLErrors[0].extensions !== undefined &&
      error?.graphQLErrors[0].extensions["code"] === "authorization"
    ) {
      refetch();
    }
  }, [error]);
  useEffect(() => {
    if (!loading && data?.keyStore?.protectedPrivateKeys !== undefined) {
      if (data?.keyStore?.protectedPrivateKeys.length < 1) {
        routerStore.push("/main");
      } else {
        const addresses = data.keyStore.protectedPrivateKeys.map(
          (value) => value?.address
        );
        addresses.map((value) => {
          accountStore.addresses.includes(value)
            ? null
            : accountStore.addAddress(value);
        });

        routerStore.push("/login");
      }
    }
  }, [loading, data]);

  return <div>{locale("불러오는 중...")}</div>;
});

export default inject("accountStore", "routerStore")(IntroView);
