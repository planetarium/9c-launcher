import { observer } from "mobx-react";
import React from "react";
import { useHistory } from "react-router";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import Text from "src/renderer/components/ui/Text";
import TextField from "src/renderer/components/ui/TextField";
import { useLoginSession } from "src/utils/useLoginSession";
import { registerStyles } from ".";

function ActivationSuccessView() {
  const history = useHistory();

  const account = useLoginSession();

  return (
    <Layout sidebar css={registerStyles}>
      <H1>Activation completed</H1>
      <Text css={{ fontSize: 14 }}>
        You can now begin your journey. Click Start to play the game.
      </Text>
      <TextField label="Your Nine Chronicles address" value={account.address} />
      <Text css={{ fontSize: 14 }}>
        Note: We strongly recommend you to backup your keystore.
      </Text>
      <ExtLink
        href={get("KeystoreBackupDocumentationUrl")}
        css={{ color: "#1EB9DB", fontSize: 14 }}
      >
        Please check the document for details.
      </ExtLink>
      <Button
        layout
        variant="primary"
        centered
        css={{ width: 200, marginTop: 180 }}
        onClick={() => history.push("/lobby")}
      >
        Done
      </Button>
    </Layout>
  );
}

export default observer(ActivationSuccessView);
