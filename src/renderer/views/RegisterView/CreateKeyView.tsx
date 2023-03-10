import { utils } from "@noble/secp256k1";
import { observer } from "mobx-react";
import React from "react";
import { useHistory } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import RetypePasswordForm, {
  FormData,
} from "src/renderer/components/RetypePasswordForm";
import H1 from "src/renderer/components/ui/H1";
import { trackEvent } from "src/utils/mixpanel";
import { useStore } from "src/utils/useStore";
import { registerStyles } from ".";

function CreateKeySubview() {
  const history = useHistory();

  const accountStore = useStore("account");

  const onPasswordSubmit = async ({ password }: FormData) => {
    trackEvent("Launcher/CreatePrivateKey");
    const account = await accountStore.importRaw(
      utils.bytesToHex(utils.randomPrivateKey()),
      password
    );

    await accountStore.login(account, password);

    history.push("/register/activationKey");
  };

  return (
    <Layout sidebar css={registerStyles}>
      <H1>Create your address </H1>
      <p style={{ marginBlockEnd: 54 }}>
        Please set a password for your address to continue. Your address will be
        generated after this step.
      </p>
      <RetypePasswordForm onSubmit={onPasswordSubmit} />
    </Layout>
  );
}

export default observer(CreateKeySubview);
