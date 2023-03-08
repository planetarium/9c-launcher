import React, { useEffect } from "react";
import { get } from "src/config";
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
  const { activated, error } = useActivationStatus(true);

  useEffect(() => {
    (async () => {
      const activationResult = await activate();

      if (!activationResult.result) {
        setState("activationFailed");
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- multiple calls to activate() when fully populated
  }, []);

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
        This process can take upto a minute. While you are waiting, we strongly
        recommend you to backup your keystore file.
      </p>
      <p>
        Here&apos;s&nbsp;
        <ExtLink
          href={get("ActivationDocumentationUrl")}
          css={{ color: "#1EB9DB" }}
        >
          the document for details.
        </ExtLink>
      </p>
    </>
  );
}

export default ActivationWaitSubview;
