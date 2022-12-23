import { Typography } from "@material-ui/core";
import { ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";
import { RouterStore } from "mobx-react-router";
import React from "react";
import { ProtectedPrivateKey } from "../../../interfaces/keystore";
import RetypePasswordForm from "../../components/RetypePasswordForm";
import { T } from "@transifex/react";
import AccountStore from "src/stores/account";
import createAccountViewStyle from "./CreateAccountView.style";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const classes = createAccountViewStyle();

    const handleSubmit = async (password: string, activationKey: string) => {
      ipcRenderer.send("mixpanel-track-event", "Launcher/CreatePrivateKey");
      const { address }: ProtectedPrivateKey = ipcRenderer.sendSync(
        "create-private-key",
        password
      );

      const [privateKey, error]: [string | undefined, Error | undefined] =
        ipcRenderer.sendSync("unprotect-private-key", address, password);
      if (
        error !== undefined ||
        privateKey === undefined ||
        privateKey === ""
      ) {
        // FIXME: Show a new error page or retry page to complete the account creation.
        console.error(
          `Failed to unprotect private key. ${error?.name}: ${error?.message}`
        );
        return;
      }

      accountStore.setPrivateKey(privateKey);
      accountStore.addAddress(address);
      accountStore.setSelectedAddress(address);
      accountStore.setActivationKey(activationKey);
      routerStore.push("/");
    };

    return (
      <div className={`create-account ${classes.root}`}>
        <Typography variant="h1" className={classes.info}>
          <T
            _str="Please set the password to complete account creation."
            _tags="createAccount"
          />
        </Typography>
        <RetypePasswordForm onSubmit={handleSubmit} useActivationKey={true} />
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CreateAccountView);
