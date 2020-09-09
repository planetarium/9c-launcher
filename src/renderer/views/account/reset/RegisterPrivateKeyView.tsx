import React, { useState } from "react";
import { TextField, Button } from "@material-ui/core";
import { RouterStore } from "mobx-react-router";
import { inject, observer } from "mobx-react";
import {
  useConvertPrivateKeyToAddressQuery,
  useRevokePrivateKeyMutation,
  useCreatePrivateKeyMutation,
} from "../../../../generated/graphql";
import AccountStore from "../../../stores/account";

import { useLocale } from "../../../i18n";

interface IRegisterPrivateKeyViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

type StateSetter<T> = (value: T) => void;

const RegisterPrivateKeyView: React.FC<IRegisterPrivateKeyViewProps> = observer(
  ({ accountStore, routerStore }) => {
    const [firstPassword, setFirstPassword] = useState("");
    const [secondPassword, setSecondPassword] = useState("");

    const { locale } = useLocale("registerPrivateKey");

    const makeHandlePasswordChange = (fn: StateSetter<string>) => {
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        fn(event.target.value);
      };
      return handleChange;
    };

    const passwordMatched =
      secondPassword !== "" && firstPassword === secondPassword;
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                passphrase,
              },
            });
            routerStore.push("/");
          });
        }
      }
    };

    return (
      <>
        <p>{locale("Please reset the password.")}</p>

        <TextField
          label={locale("Password")}
          type="password"
          onChange={makeHandlePasswordChange(setFirstPassword)}
        />
        <br />
        <TextField
          error={!passwordMatched}
          label={locale("Retype Password")}
          type="password"
          onChange={makeHandlePasswordChange(setSecondPassword)}
          helperText={
            !passwordMatched ? locale("Password does not match.") : ""
          }
        />
        <br />
        <Button onClick={handleSubmit}>{locale("Done")}</Button>
      </>
    );
  }
);

export default inject("accountStore", "routerStore")(RegisterPrivateKeyView);
