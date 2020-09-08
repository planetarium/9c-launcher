import React, { useState, ChangeEvent, MouseEvent } from "react";
import mixpanel from "mixpanel-browser";
import { observer, inject } from "mobx-react";
import {
  Button,
  FormControl,
  InputLabel,
  Typography,
  OutlinedInput,
} from "@material-ui/core";

import { ExecutionResult } from "react-apollo";
import { RouterStore } from "mobx-react-router";
import VisibilityAdornment from "../../components/VisibilityAdornment";

import {
  useCreatePrivateKeyMutation,
  CreatePrivateKeyMutation,
} from "../../../generated/graphql";

import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CreateAccountView.style";

import { useLocale } from "../../i18n";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const [createAccount] = useCreatePrivateKeyMutation();
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { locale } = useLocale("createAccount");

    const classes = createAccountViewStyle();

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPasswordConfirm(e.target.value);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleShowPassword = (e: MouseEvent<HTMLButtonElement>) => {
      setShowPassword(!showPassword);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleShowPasswordConfirm = (e: MouseEvent<HTMLButtonElement>) => {
      setShowPasswordConfirm(!showPasswordConfirm);
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
        if (keyStore == null) return;

        const { address } = keyStore.createPrivateKey.publicKey;
        const privateKey = keyStore.createPrivateKey.hex;

        accountStore.setPrivateKey(privateKey);
        accountStore.addAddress(address);
        accountStore.setSelectedAddress(address);
        routerStore.push("/account/create/copy");
      });
    };

    return (
      <div className={`create-account ${classes.root}`}>
        <Typography variant="h1" className={classes.info}>
          {(locale(
            "Please set the password to complete account creation."
          ) as string[]).map((paragraph) => (
            <span key={paragraph}>{paragraph}</span>
          ))}
        </Typography>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <InputLabel className={classes.label}>
              {locale("Password")}
            </InputLabel>
            <OutlinedInput
              id="password-input"
              onChange={handlePasswordChange}
              className={classes.textInput}
              type={showPassword ? "text" : "password"}
              endAdornment={
                <VisibilityAdornment
                  onClick={handleShowPassword}
                  show={showPassword}
                />
              }
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel className={classes.label}>
              {locale("Confirm")}
            </InputLabel>
            <OutlinedInput
              id="password-confirm-input"
              error={password !== passwordConfirm}
              type={showPasswordConfirm ? "text" : "password"}
              onChange={handlePasswordConfirmChange}
              className={classes.textInput}
              endAdornment={
                <VisibilityAdornment
                  onClick={handleShowPasswordConfirm}
                  show={showPasswordConfirm}
                />
              }
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
