import React, { useState } from "react";
import { TextField, InputLabel, Button } from "@material-ui/core";
import { useValidatePrivateKeyQuery } from "../../../../generated/graphql";
import { RouterStore } from "mobx-react-router";
import { observer, inject } from "mobx-react";
import AccountStore from "../../../stores/account";

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

    // 스탠드얼론에서 미처 감싸지 못한 예외들이 GraphQL ExecutionError로 나옵니다.
    console.error(error);

    const privateKeyChangeHandle = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setPrivateKeyState(event.target.value);
    };

    const IsPrivateKeyValid =
      undefined === error && !loading && data?.validation.privateKey;

    const privateKeySubmitHandle = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      if (IsPrivateKeyValid) {
        accountStore.setPrivateKey(privateKey);
        routerStore.push("/account/reset/1");
      }
    };

    return (
      <>
        <p>Enter your private key to reset your password</p>
        <TextField label="Private Key" onChange={privateKeyChangeHandle} />
        <br />
        <Button
          color={IsPrivateKeyValid ? "primary" : "secondary"}
          onClick={privateKeySubmitHandle}
        >
          Enter
        </Button>
        <br />
        <a href="/account/revoke">Forgot private key?</a>
      </>
    );
  })
);
