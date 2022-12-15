import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import H1 from "src/v2/components/ui/H1";
import RetypePasswordForm, {
  FormData,
} from "src/v2/components/RetypePasswordForm";
import { useStore } from "src/v2/utils/useStore";
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
  const [error, setError] = useState<Error | null>(null);

  account.generatePrivateKey();

  const onSubmit = ({ password, activationKey }: FormData) => {
    trackEvent("Launcher/CreatePrivateKey");
    account
      .getPrivateKeyAndForget()
      .then((privateKey) => account.importRaw(privateKey, password));

    account.setLoginStatus(true);
    account.setActivationKey(activationKey!);
    history.push("/lobby?first");
  };

  return (
    <Layout sidebar css={registerStyles}>
      <H1>Create your account</H1>
      <p style={{ marginBlockEnd: 54 }}>Please set your password only.</p>
      <RetypePasswordForm
        address={account.selectedAddress}
        onSubmit={onSubmit}
        useActivitionKey
      />
    </Layout>
  );
}

export default observer(RegisterView);
