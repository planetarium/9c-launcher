import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import loading from "src/renderer/resources/icons/loading.png";
import { useActivate } from "src/utils/useActivate";
import { useActivationStatus } from "src/utils/useActivationStatus";
import { registerStyles } from ".";
import { LoadingImage } from "../MonsterCollectionOverlay/base";

function ActivationWaitView() {
  const history = useHistory();

  const activate = useActivate();
  const { activated, error } = useActivationStatus(true);

  useEffect(() => {
    (async () => {
      const activationResult = await activate();

      if (!activationResult.result) {
        history.push("/register/activationFail");
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- multiple calls to activate() when fully populated
  }, []);

  useEffect(() => {
    if (activated) {
      history.push("/register/activationSuccess");
    }

    if (error) {
      history.push("/register/activationFail");
    }
  }, [activated, error, history]);

  return (
    <Layout sidebar css={registerStyles}>
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
        css={{
          width: 200,
          marginTop: 180,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        disabled
      >
        <LoadingImage src={loading} />
      </Button>
    </Layout>
  );
}

export default observer(ActivationWaitView);
