import * as React from "react";
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
import { useCreatePrivateKeyMutation } from "../../../generated/graphql";
import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CreateAccountView.style";
import { RouterStore } from "mobx-react-router";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView: React.FC<ICreateAccountProps> = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const { push } = routerStore;
    const [createAccount, { data }] = useCreatePrivateKeyMutation();
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const classes = createAccountViewStyle();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    const handlePasswordConfirmChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setPasswordConfirm(e.target.value);
    };

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      createAccount({
        variables: {
          passphrase: password,
        },
      }).then((e: ExecutionResult<any>) => {
        const { address } = e.data.keyStore.createPrivateKey;
        accountStore.addAddress(address);
        accountStore.setSelectedAddress(address);
        push("/");
      });
    };

    return (
      <div className="create-account" className={classes.root}>
        <Typography className={classes.info}>
          Please set the password <br /> to complete account creation.
        </Typography>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <TextField
              id="password-input"
              label="Password"
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
              label="Password (Confirm)"
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
            onSubmit={handleSubmit}
          >
            Done
          </Button>
        </form>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CreateAccountView);
