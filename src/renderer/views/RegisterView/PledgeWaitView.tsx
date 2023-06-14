import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import { T } from "src/renderer/i18n";
import loading from "src/renderer/resources/icons/loading.png";
import { registerStyles } from ".";
import { LoadingImage } from "../MonsterCollectionOverlay/base";
import { usePledge } from "src/utils/usePledge";
import { ActivationResult } from "src/interfaces/activation";

const transifexTags = "v2/views/register/PledgeWaitView";

function PledgeWaitView() {
  const history = useHistory();
  const { search } = useLocation();
  const pledge = usePledge();

  useEffect(() => {
    (async () => {
      const result: ActivationResult = await pledge();
      if (result.result) {
        history.push("/register/pledgeSuccess");
      } else {
        console.log(result.error);
        history.push("/register/pledgeFail");
      }
    })();
  }, []);

  return (
    <Layout sidebar css={registerStyles}>
      <H1>
        <T _str="Pledge in progress..." _tags={transifexTags} />
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

export default observer(PledgeWaitView);
