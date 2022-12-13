import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import H1 from "src/v2/components/ui/H1";
import RetypePasswordForm, {
  FormData,
} from "src/v2/components/RetypePasswordForm";
import { useStore } from "src/v2/utils/useStore";
import { ipcRenderer } from "electron";
import { RawPrivateKey } from "../../../interfaces/keystore";
import { useHistory } from "react-router";
import { CSS } from "src/v2/stitches.config";
import { trackEvent } from "src/v2/utils/mixpanel";

const registerStyles: CSS = {
  padding: 52,
  boxSizing: "border-box",
  "& > * + *": {
    marginTop: "1rem",
  },
};

function RegisterView() {
  const account = useStore("account");
  const history = useHistory();
  const [key, setKey] = useState<RawPrivateKey | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(
    () =>
      void (async () => {
        if (key) return;
        setKey(await ipcRenderer.invoke("generate-private-key"));
      })().catch(setError),
    [key]
  );

  const onSubmit = ({ password, activationKey }: FormData) => {
    if (!key) return;

    trackEvent("Launcher/CreatePrivateKey");
    ipcRenderer.sendSync("import-private-key", key.privateKey, password);
    const [privateKey, error]: [string, undefined] | [undefined, Error] =
      ipcRenderer.sendSync("unprotect-private-key", key.address, password);
    if (error !== undefined) {
      setError(error);
      return;
    }

    account.setPrivateKey(privateKey!);
    account.addAddress(key.address);
    account.setSelectedAddress(key.address);
    account.setLoginStatus(true);
    account.setActivationKey(activationKey!);
    ipcRenderer.send("standalone/set-signer-private-key", account.privateKey);
    history.push("/lobby?first");
  };

  return (
    <Layout sidebar css={registerStyles}>
      <H1>Create your account</H1>
      <p style={{ marginBlockEnd: 54 }}>Please set your password only.</p>
      <RetypePasswordForm
        address={key?.address}
        onSubmit={onSubmit}
        useActivitionKey
      />
      {error !== null && (
        <p>{`Failed to unprotect private key. ${error.name}: ${error.message}`}</p>
      )}
    </Layout>
  );
}

export default observer(RegisterView);
