import { utils } from "@noble/secp256k1";
import React from "react";
import RetypePasswordForm, {
  FormData,
} from "src/renderer/components/RetypePasswordForm";
import H1 from "src/renderer/components/ui/H1";
import { trackEvent } from "src/utils/mixpanel";
import { useStore } from "src/utils/useStore";
import { RegisterState } from "..";

type Props = {
  setState: (state: RegisterState) => void;
};

function CreateKeySubview({ setState }: Props) {
  const accountStore = useStore("account");

  const onPasswordSubmit = async ({ password }: FormData) => {
    trackEvent("Launcher/CreatePrivateKey");
    const account = await accountStore.importRaw(
      utils.bytesToHex(utils.randomPrivateKey()),
      password
    );

    await accountStore.login(account, password);

    setState("enterActivationCode");
  };

  return (
    <>
      <H1>Create your address </H1>
      <p style={{ marginBlockEnd: 54 }}>
        Please set a password for your address to continue. Your address will be
        generated after this step.
      </p>
      <RetypePasswordForm onSubmit={onPasswordSubmit} />
    </>
  );
}

export default CreateKeySubview;
