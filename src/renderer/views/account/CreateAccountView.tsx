import { Typography } from "@material-ui/core";
import { ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";
import { RouterStore } from "mobx-react-router";
import React from "react";

import { CreateAccount } from "../../../interfaces/i18n";
import { useCreatePrivateKeyMutation } from "../../../generated/graphql";

import { useLocale } from "../../i18n";
import RetypePasswordForm from "../../components/RetypePasswordForm";
import AccountStore from "../../stores/account";

import createAccountViewStyle from "./CreateAccountView.style";
import { PrivateKey, ProtectedPrivateKey } from "src/main/headless/key-store";

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

      const privateKey: PrivateKey = ipcRenderer.sendSync(
        "unprotect-private-key",
        address,
        password
      );

      accountStore.setPrivateKey(privateKey);
      accountStore.addAddress(address);
      accountStore.setSelectedAddress(address);
      accountStore.setActivationKey(activationKey);
      routerStore.push("/account/create/copy");
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
        <RetypePasswordForm onSubmit={handleSubmit} />
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CreateAccountView);
