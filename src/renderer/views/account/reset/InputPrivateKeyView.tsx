import React, { useState, MouseEvent, ChangeEvent } from "react";
import { TextField, InputLabel, Button } from "@material-ui/core";
import TextButton from "../../../components/TextButton";
import { useValidatePrivateKeyQuery } from "../../../../generated/graphql";
import { RouterStore } from "mobx-react-router";
import { observer, inject } from "mobx-react";
import AccountStore from "../../../stores/account";

import { useLocale } from "../../../i18n";
import inputPrivateKeyViewStyle from "./inputPrivateKeyView.style";

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

    const classes = inputPrivateKeyViewStyle();

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

    const handleRevokeAccount = (event: MouseEvent<HTMLButtonElement>) => {
      routerStore.push("/account/revoke");
    };

    return (
      <>
        <h1 className={classes.title}>
          {locale("Enter your private key to reset your password")}
        </h1>
        <TextField
          label={locale("Private Key")}
          id="privateKey-input"
          onChange={privateKeyChangeHandle}
          className={classes.newLine}
        />
        <Button
          id="submit"
          color={IsPrivateKeyValid ? "primary" : "secondary"}
          onClick={handleSubmit}
          className={classes.newLine}
        >
          {locale("Enter")}
        </Button>
        <TextButton
          id="revoke-key"
          onClick={handleRevokeAccount}
          className={classes.newLine}
        >
          {locale("Forgot private key?")}
        </TextButton>
      </>
    );
  })
);
