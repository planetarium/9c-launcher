import React, { useEffect } from "react";
import { ACTIVATION_DOCUMENTATION_LINK } from "src/config";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import { useActivate } from "src/utils/useActivate";
import { useActivationStatus } from "src/utils/useActivationStatus";
import { RegisterState } from "..";

interface Props {
  setState: (state: RegisterState) => void;
}

function ActivationWaitSubview({ setState }: Props) {
  const activate = useActivate();
  const { activated, error } = useActivationStatus();

  useEffect(() => {
    (async () => {
      const activationResult = await activate();

      if (!activationResult.result) {
        setState("activationFailed");
      }
    })();
  }, [activate, setState]);

  useEffect(() => {
    if (activated) {
      setState("activationSuccess");
    }

    if (error) {
      setState("activationFailed");
    }
  }, [activated, error, setState]);

  return (
    <>
      <H1>Activation is in progress...</H1>
      <p style={{ marginBlockEnd: 54 }}>
        This process can take less than a minute. While you waiting, we strongly
        recommend you to backup your keystore file.
      </p>
      <p>
        Here&apos;s&nbsp;
        <ExtLink href={ACTIVATION_DOCUMENTATION_LINK}>
          the document for details.
        </ExtLink>
      </p>
    </>
  );
}

export default ActivationWaitSubview;
