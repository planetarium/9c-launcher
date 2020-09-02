import * as React from "react";
import mixpanel from "mixpanel-browser";
import { observer, inject } from "mobx-react";
import {
  Button,
  FormControl,
  InputLabel,
  TextField,
  Typography,
} from "@material-ui/core";

import { ExecutionResult } from "react-apollo";
import { useState } from "react";
import { IStoreContainer } from "../../../interfaces/store";
import {
  useCreatePrivateKeyMutation,
  CreatePrivateKeyMutation,
} from "../../../generated/graphql";
import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CreateAccountView.style";
import { RouterStore } from "mobx-react-router";

import { useLocale } from "../../i18n";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView: React.FC<ICreateAccountProps> = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const [createAccount, { data }] = useCreatePrivateKeyMutation();
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const locale = useLocale("createAccount");

    const classes = createAccountViewStyle();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    const handlePasswordConfirmChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setPasswordConfirm(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      mixpanel.track("Launcher/CreatePrivateKey");
      createAccount({
        variables: {
          passphrase: password,
        },
      }).then((e: ExecutionResult<CreatePrivateKeyMutation>) => {
        const keyStore = e.data?.keyStore;
        if (null == keyStore) {
          return;
        }
        const address = keyStore.createPrivateKey.publicKey.address;
        const privateKey = keyStore.createPrivateKey.hex;

        accountStore.setPrivateKey(privateKey);
        accountStore.addAddress(address);
        accountStore.setSelectedAddress(address);
        routerStore.push("/account/create/copy");
      });
    };

    return (
      <div className={`create-account ${classes.root}`}>
        {(locale(
          "Please set the password to complete account creation."
        ) as string[]).map((paragraph) => (
          <Typography className={classes.info} key={paragraph}>
            {paragraph}
          </Typography>
        ))}
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <TextField
              id="password-input"
              label={locale("Password")}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={handlePasswordChange}
              className={classes.textInput}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              id="password-confirm-input"
              label={locale("Confirm")}
              error={password !== passwordConfirm}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={handlePasswordConfirmChange}
              className={classes.textInput}
            />
          </FormControl>
          <Button
            disabled={password === "" || password !== passwordConfirm}
            color="primary"
            type="submit"
            className={classes.submit}
            variant="contained"
          >
            {locale("Done")}
          </Button>
        </form>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CreateAccountView);
