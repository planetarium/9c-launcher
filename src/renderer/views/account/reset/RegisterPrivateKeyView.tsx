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

interface IRegisterPrivateKeyViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

type StateSetter<T> = (value: T) => void;

export const RegisterPrivateKeyView: React.FC<IRegisterPrivateKeyViewProps> = inject(
  "accountStore",
  "routerStore"
)(
  observer(({ accountStore, routerStore }) => {
    const [firstPassword, setFirstPassword] = useState("");
    const [secondPassword, setSecondPassword] = useState("");

    const makePasswordChangeHandle = (fn: StateSetter<string>) => {
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        fn(event.target.value);
      };
      return handleChange;
    };

    // FIXME: 좀 더 나은 변수명이 있을 것 같습니다.
    const IsDoublePasswordEqual =
      "" !== secondPassword && firstPassword === secondPassword;
    const {
      loading: loadingAddress,
      data,
    } = useConvertPrivateKeyToAddressQuery({
      variables: {
        privateKey: accountStore.privateKey,
      },
    });
    const [revokePrivateKey, {}] = useRevokePrivateKeyMutation();
    const [createPrivateKey, {}] = useCreatePrivateKeyMutation();

    const submitHandle = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (IsDoublePasswordEqual) {
        const address = data?.keyStore?.privateKey.publicKey.address;
        const passphrase = firstPassword;
        if (!loadingAddress) {
          await revokePrivateKey({
            variables: {
              address: address,
            },
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
        <p>Please reset the password.</p>

        <TextField
          label="Password"
          type="password"
          onChange={makePasswordChangeHandle(setFirstPassword)}
        />
        <br />
        <TextField
          error={!IsDoublePasswordEqual}
          label="Retype Password"
          type="password"
          onChange={makePasswordChangeHandle(setSecondPassword)}
          helperText={!IsDoublePasswordEqual ? "Password is not equal." : ""}
        />
        <br />
        <Button onClick={submitHandle}>Done</Button>
      </>
    );
  })
);
