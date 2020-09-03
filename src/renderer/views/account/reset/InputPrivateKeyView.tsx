import React, { useState, MouseEvent, ChangeEvent } from "react";
import { TextField, InputLabel, Button } from "@material-ui/core";
import { useValidatePrivateKeyQuery } from "../../../../generated/graphql";
import { RouterStore } from "mobx-react-router";
import { observer, inject } from "mobx-react";
import AccountStore from "../../../stores/account";

import { useLocale } from "../../../i18n";

interface IInputPrivateKeyViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

export const InputPrivateKeyView: React.FC<IInputPrivateKeyViewProps> = inject(
  "accountStore",
  "routerStore"
)(
  observer(({ accountStore, routerStore }) => {
    const [privateKey, setPrivateKeyState] = useState("");

    const { loading, data, error } = useValidatePrivateKeyQuery({
      variables: {
        privateKey,
      },
    });

    const { locale } = useLocale("inputPrivateKey");

    // 스탠드얼론에서 미처 감싸지 못한 예외들이 GraphQL ExecutionError로 나옵니다.
    console.error(error);

    const privateKeyChangeHandle = (event: ChangeEvent<HTMLInputElement>) => {
      setPrivateKeyState(event.target.value);
    };

    const IsPrivateKeyValid =
      undefined === error && !loading && data?.validation.privateKey;

    const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
      if (IsPrivateKeyValid) {
        accountStore.setPrivateKey(privateKey);
        routerStore.push("/account/reset/input/passphrase");
      }
    };

    return (
      <>
        <p>{locale("Enter your private key to reset your password")}</p>
        <TextField
          label={locale("Private Key")}
          onChange={privateKeyChangeHandle}
        />
        <br />
        <Button
          color={IsPrivateKeyValid ? "primary" : "secondary"}
          onClick={handleSubmit}
        >
          {locale("Enter")}
        </Button>
        <br />
        {/* FIXME: https://github.com/planetarium/9c-launcher/pull/109#discussion_r448705979 */}
        <a href="/account/revoke">{locale("Forgot private key?")}</a>
      </>
    );
  })
);
