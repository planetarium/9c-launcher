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
import registerPrivateKeyViewStyle from "./RegisterPrivateKeyView.style";
import { RegisterPrivateKeyEvent } from "../../../../interfaces/event";

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
    const [isInvalid, setIsInvalid] = useState(false);

    const classes = registerPrivateKeyViewStyle();

    const { locale } = useLocale("registerPrivateKey");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsInvalid(false);
    };

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

    const handleSubmit = async (event: RegisterPrivateKeyEvent) => {
      const password = event.target.password.value;
      const passwordConfirm = event.target.passwordConfirm.value;

      if (password !== passwordConfirm) {
        setIsInvalid(true);
        return;
      }

      const address = data?.keyStore?.privateKey.publicKey.address;
      if (address === undefined) throw Error("Address not found");
      if (!loadingAddress) {
        await revokePrivateKey({
          variables: { address },
        }).finally(async () => {
          await createPrivateKey({
            variables: {
              privateKey: accountStore.privateKey,
              passphrase: password,
            },
          });
          routerStore.push("/");
        });
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <h1 className={classes.title}>
          {locale("Please reset the password.")}
        </h1>

        <TextField
          label={locale("Password")}
          type="password"
          name="password"
          className={classes.newLine}
          onChange={handleChange}
        />
        <TextField
          error={isInvalid}
          label={locale("Retype Password")}
          type="password"
          name="passwordConfirm"
          helperText={isInvalid ? locale("Password does not match.") : ""}
          className={classes.newLine}
          onChange={handleChange}
        />
        <Button type="submit" className={classes.newLine}>
          {locale("Done")}
        </Button>
      </form>
    );
  })
);
