import { Typography } from "@material-ui/core";
import { ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";
import { RouterStore } from "mobx-react-router";
import React from "react";
import { useCreatePrivateKeyMutation } from "../../../generated/graphql";
import { CreateAccount } from "../../../interfaces/i18n";
import { ProtectedPrivateKey } from "../../../main/headless/key-store";
import RetypePasswordForm from "../../components/RetypePasswordForm";
import { useLocale } from "../../i18n";
import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CreateAccountView.style";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const [createAccount, { data }] = useCreatePrivateKeyMutation();

    const { locale } = useLocale<CreateAccount>("createAccount");

    const classes = createAccountViewStyle();

    const handleSubmit = async (password: string, activationKey: string) => {
      ipcRenderer.send("mixpanel-track-event", "Launcher/CreatePrivateKey");
      const { address }: ProtectedPrivateKey = ipcRenderer.sendSync(
        "create-private-key",
        password
      );

      const [privateKey, error]: [
        string | undefined,
        Error | undefined
      ] = ipcRenderer.sendSync("unprotect-private-key", address, password);
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
          {(locale(
            "계정 생성을 마치기 위해 비밀번호를 설정해주세요."
          ) as string[]).map((paragraph) => (
            <span key={paragraph}>{paragraph}</span>
          ))}
        </Typography>
        <RetypePasswordForm onSubmit={handleSubmit} useActivationKey={true} />
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CreateAccountView);
