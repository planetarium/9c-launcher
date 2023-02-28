import React from "react";
import ActivationKeyForm, {
  FormData,
} from "src/renderer/components/ActivationKeyForm";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import { trackEvent } from "src/utils/mixpanel";
import { useStore } from "src/utils/useStore";
import { RegisterState } from "..";

interface Props {
  setState: (state: RegisterState) => void;
}

function ActivationKeySubview({ setState }: Props) {
  const accountStore = useStore("account");

  const onSubmit = ({ activationKey }: FormData) => {
    trackEvent("Launcher/EnterActivationCode");

    setState("waitActivation");

    accountStore.setActivationKey(activationKey);
  };

  return (
    <>
      <H1>Activate your address</H1>
      <p style={{ marginBlockEnd: 54 }}>
        You need an activation code to activate your Nine Chronicles address. If
        you already have one, you can paste it below and activate it now.
      </p>
      <ExtLink target="_blank" href="">
        Get the code
      </ExtLink>
      <ActivationKeyForm onSubmit={onSubmit} />
    </>
  );
}

export default ActivationKeySubview;
