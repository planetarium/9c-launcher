import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import { T } from "src/renderer/i18n";
import loading from "src/renderer/resources/icons/loading.png";
import { useActivate } from "src/utils/useActivate";
import { useActivationStatus } from "src/utils/useActivationStatus";
import { registerStyles } from ".";
import { LoadingImage } from "../MonsterCollectionOverlay/base";

const transifexTags = "v2/views/register/ActivationWaitView";

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
      <H1>
        <T _str="Activation is in progress..." _tags={transifexTags} />
      </H1>
      <p>
        <T
          _str="This process can take upto a minute. While you are waiting, we strongly recommend you to backup your keystore file."
          _tags={transifexTags}
        />
      </p>
      <ExtLink
        href={get("KeystoreBackupDocumentationUrl")}
        css={{ color: "#1EB9DB" }}
      >
        <T
          _str="Please check the document for details."
          _tags={transifexTags}
        />
      </ExtLink>
      <Button
        layout
        variant="primary"
        centered
        css={{
          marginTop: 160,
        }}
        disabled
      >
        <LoadingImage src={loading} />
      </Button>
    </Layout>
  );
}

export default observer(ActivationWaitView);
