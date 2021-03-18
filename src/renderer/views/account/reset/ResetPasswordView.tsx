import React, { useState, useEffect } from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import { RouterStore } from "mobx-react-router";
import AccountStore from "../../../stores/account";
import { inject, observer } from "mobx-react";

import registerPrivateKeyViewStyle from "./ResetPasswordView.style";

import { useLocale } from "../../../i18n";
import { RegisterPrivateKey } from "../../../../interfaces/i18n";
import RetypePasswordForm from "../../../components/RetypePasswordForm";
import { ipcRenderer } from "electron";

interface IResetPasswordViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const ResetPasswordView: React.FC<IResetPasswordViewProps> = observer(
  ({ accountStore, routerStore }) => {
    const [firstPassword, setFirstPassword] = useState("");
    const [secondPassword, setSecondPassword] = useState("");

    const classes = registerPrivateKeyViewStyle();

    const { locale } = useLocale<RegisterPrivateKey>("registerPrivateKey");

    const address = ipcRenderer.sendSync(
      "convert-private-key-to-address",
      accountStore.privateKey
    );

    const handleSubmit = async (password: string) => {
      try {
        ipcRenderer.sendSync("revoke-protected-private-key", address);
      } finally {
        ipcRenderer.sendSync(
          "import-private-key",
          accountStore.privateKey,
          password
        );
        routerStore.push("/");
      }
    };

    return (
      <div className={classes.root}>
        <Typography variant="h1" className={classes.title}>
          {locale("비밀번호를 재설정해주세요.")}
        </Typography>
        <RetypePasswordForm onSubmit={handleSubmit} />
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(ResetPasswordView);
