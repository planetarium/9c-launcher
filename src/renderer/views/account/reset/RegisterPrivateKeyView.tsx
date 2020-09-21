import React, { useState, useEffect } from "react";
import { TextField, Button } from "@material-ui/core";
import { RouterStore } from "mobx-react-router";
import {
  useConvertPrivateKeyToAddressQuery,
  useRevokePrivateKeyMutation,
  useCreatePrivateKeyMutation,
} from "../../../../generated/graphql";
import AccountStore from "../../../stores/account";
import { inject, observer } from "mobx-react";

import { useLocale } from "../../../i18n";
import { RegisterPrivateKey } from "../../../../interfaces/i18n";

interface IRegisterPrivateKeyViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const RegisterPrivateKeyView: React.FC<IRegisterPrivateKeyViewProps> = observer(
  ({ accountStore, routerStore }) => {
    const [firstPassword, setFirstPassword] = useState("");
    const [secondPassword, setSecondPassword] = useState("");

    const { locale } = useLocale<RegisterPrivateKey>("registerPrivateKey");

    const makeHandlePasswordChange = (fn: (value: string) => void) => {
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        fn(event.target.value);
      };
      return handleChange;
    };

    const passwordMatched =
      secondPassword.length > 0 && firstPassword === secondPassword;
    const {
      loading: loadingAddress,
      data,
    } = useConvertPrivateKeyToAddressQuery({
      variables: {
        privateKey: accountStore.privateKey,
      },
    });
    const [revokePrivateKey] = useRevokePrivateKeyMutation();
    const [createPrivateKey] = useCreatePrivateKeyMutation();

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (passwordMatched) {
        const address = data?.keyStore?.privateKey.publicKey.address;
        if (address === undefined) throw Error("Address not found");
        const passphrase = firstPassword;
        if (!loadingAddress) {
          await revokePrivateKey({
            variables: { address },
          }).finally(async () => {
            await createPrivateKey({
              variables: {
                privateKey: accountStore.privateKey,
                passphrase: passphrase,
              },
            });
            routerStore.push("/");
          });
        }
      }
    };

    return (
      <>
        <p>{locale("비밀번호를 재설정해주세요.")}</p>

        <TextField
          label={locale("비밀번호")}
          type="password"
          onChange={makeHandlePasswordChange(setFirstPassword)}
        />
        <br />
        <TextField
          error={!passwordMatched}
          label={locale("비밀번호 재입력")}
          type="password"
          onChange={makeHandlePasswordChange(setSecondPassword)}
          helperText={
            !passwordMatched ? locale("비밀번호가 알맞지 않습니다") : ""
          }
        />
        <br />
        <Button onClick={handleSubmit}>{locale("마치기")}</Button>
      </>
    );
  }
);

export default inject("accountStore", "routerStore")(RegisterPrivateKeyView);
