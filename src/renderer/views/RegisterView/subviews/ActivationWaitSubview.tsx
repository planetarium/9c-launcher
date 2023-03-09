import React, { useEffect } from "react";
import { get } from "src/config";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import loading from "src/renderer/resources/icons/loading.png";
import { useActivate } from "src/utils/useActivate";
import { useActivationStatus } from "src/utils/useActivationStatus";
import { RegisterState } from "..";
import { LoadingImage } from "../../MonsterCollectionOverlay/base";

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
      <ExtLink
        href={get("KeystoreBackupDocumentationUrl")}
        css={{ color: "#1EB9DB" }}
      >
        Please check the document for details.
      </ExtLink>
      <Button
        layout
        variant="primary"
        centered
        css={{ width: 200, marginTop: 180 }}
        disabled
      >
        <LoadingImage src={loading} />
      </Button>
    </>
  );
}

export default ActivationWaitSubview;
