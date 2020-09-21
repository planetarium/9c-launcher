import React, { useState, MouseEvent, ChangeEvent } from "react";
import { TextField, InputLabel, Button } from "@material-ui/core";
import TextButton from "../../../components/TextButton";
import { useValidatePrivateKeyQuery } from "../../../../generated/graphql";
import { RouterStore } from "mobx-react-router";
import { observer, inject } from "mobx-react";
import AccountStore from "../../../stores/account";

import { useLocale } from "../../../i18n";
import { InputPrivateKey } from "../../../../interfaces/i18n";

interface IInputPrivateKeyViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const InputPrivateKeyView: React.FC<IInputPrivateKeyViewProps> = observer(
  ({ accountStore, routerStore }) => {
    const [privateKey, setPrivateKeyState] = useState("");

    const { loading, data, error } = useValidatePrivateKeyQuery({
      variables: {
        privateKey,
      },
    });

    const { locale } = useLocale<InputPrivateKey>("inputPrivateKey");

    // 스탠드얼론에서 미처 감싸지 못한 예외들이 GraphQL ExecutionError로 나옵니다.
    if (error) console.error(error);

    const privateKeyChangeHandle = (event: ChangeEvent<HTMLInputElement>) => {
      setPrivateKeyState(event.target.value);
    };

    const isPrivateKeyValid =
      error === undefined && !loading && (data?.validation.privateKey ?? false);

    const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
      if (isPrivateKeyValid) {
        accountStore.setPrivateKey(privateKey);
        routerStore.push("/account/reset/input/passphrase");
      }
    };

    const handleRevokeAccount = (event: MouseEvent<HTMLButtonElement>) => {
      routerStore.push("/account/revoke");
    };

    return (
      <>
        <p>{locale("비밀번호를 재설정하기 위해 개인키를 입력해주세요.")}</p>
        <TextField label={locale("개인키")} onChange={privateKeyChangeHandle} />
        <Button
          color={isPrivateKeyValid ? "primary" : "secondary"}
          onClick={handleSubmit}
        >
          {locale("Enter")}
        </Button>
        <TextButton onClick={handleRevokeAccount}>
          {locale("개인키를 잊으셨나요?")}
        </TextButton>
      </>
    );
  }
);

export default inject("accountStore", "routerStore")(InputPrivateKeyView);
