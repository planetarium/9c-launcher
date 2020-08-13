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

    const makeHandlePasswordChange = (fn: StateSetter<string>) => {
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        fn(event.target.value);
      };
      return handleChange;
    };

    const passwordMatched =
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
        <p>Please reset the password.</p>

        <TextField
          label="Password"
          type="password"
          onChange={makeHandlePasswordChange(setFirstPassword)}
        />
        <br />
        <TextField
          error={!passwordMatched}
          label="Retype Password"
          type="password"
          onChange={makeHandlePasswordChange(setSecondPassword)}
          helperText={!passwordMatched ? "Password is not equal." : ""}
        />
        <br />
        <Button onClick={handleSubmit}>Done</Button>
      </>
    );
  })
);
