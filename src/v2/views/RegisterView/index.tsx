import React, { useState } from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import styles from "./styles.module.scss";
import H1 from "src/v2/components/ui/H1";
import RetypePasswordForm, {
  FormData,
} from "src/v2/components/RetypePasswordForm";
import { useStore } from "src/v2/utils/useStore";
import { ipcRenderer } from "electron";
import { ProtectedPrivateKey } from "src/main/headless/key-store";
import { useHistory } from "react-router";

function RegisterView() {
  const account = useStore("account");
  const history = useHistory();
  const [error, setError] = useState<Error | null>(null);

  const onSubmit = ({ password, activationKey }: FormData) => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/CreatePrivateKey");
    const { address }: ProtectedPrivateKey = ipcRenderer.sendSync(
      "create-private-key",
      password
    );
    const [privateKey, error]:
      | [string, undefined]
      | [undefined, Error] = ipcRenderer.sendSync(
      "unprotect-private-key",
      address,
      password
    );
    if (error !== undefined) {
      setError(error);
      return;
    }

    account.setPrivateKey(privateKey!);
    account.addAddress(address);
    account.setSelectedAddress(address);
    account.setActivationKey(activationKey!);
    history.push("/");
  };

  return (
    <Layout sidebar className={styles.register}>
      <H1>Create your account</H1>
      <p style={{ marginBlockEnd: 54 }}>Please set your password only.</p>
      <RetypePasswordForm onSubmit={onSubmit} useActivitionKey />
      {error !== null && (
        <p>{`Failed to unprotect private key. ${error.name}: ${error.message}`}</p>
      )}
    </Layout>
  );
}

export default observer(RegisterView);
