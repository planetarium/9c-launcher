import React, { useState, ChangeEvent, MouseEvent } from "react";
import { observer, inject } from "mobx-react";
import {
  Typography,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@material-ui/core";

import RetypePasswordForm from "../../components/RetypePasswordForm";

import { ExecutionResult } from "react-apollo";
import { IStoreContainer } from "../../../interfaces/store";

import {
  useCreatePrivateKeyMutation,
  CreatePrivateKeyMutation,
} from "../../../generated/graphql";

import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CreateAccountView.style";
import { RouterStore } from "mobx-react-router";

import { useLocale } from "../../i18n";
import { CreateAccount } from "../../../interfaces/i18n";
import { ipcRenderer } from "electron";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const [createAccount, { data }] = useCreatePrivateKeyMutation();

    const { locale } = useLocale<CreateAccount>("createAccount");

    const classes = createAccountViewStyle();

    const handleSubmit = async (password: string) => {
      ipcRenderer.send("mixpanel-track-event", "Launcher/CreatePrivateKey");
      const executionResult = await createAccount({
        variables: {
          passphrase: password,
        },
      });

      const keyStore = executionResult.data?.keyStore;
      if (null == keyStore) {
        return;
      }
      const address = keyStore.createPrivateKey.publicKey.address;
      const privateKey = keyStore.createPrivateKey.hex;

      accountStore.setPrivateKey(privateKey);
      accountStore.addAddress(address);
      accountStore.setSelectedAddress(address);
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
