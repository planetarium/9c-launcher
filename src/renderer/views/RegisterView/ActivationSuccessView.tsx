import { t } from "@transifex/native";
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
import { T } from "src/renderer/i18n";
import { useLoginSession } from "src/utils/useLoginSession";
import { registerStyles } from ".";

const transifexTags = "v2/views/register/ActivationSuccessView";

function ActivationSuccessView() {
  const history = useHistory();

  const account = useLoginSession();

  return (
    <Layout sidebar css={registerStyles}>
      <H1>
        <T _str="Activation completed" _tags={transifexTags} />
      </H1>
      <Text css={{ fontSize: 14 }}>
        <T
          _str="You can now begin your journey. Click Start to play the game."
          _tags={transifexTags}
        />
      </Text>
      <TextField
        label={t("Your Nine Chronicles address", { _tags: transifexTags })}
        value={account.address}
      />
      <Text css={{ fontSize: 14 }}>
        <T
          _str="Note: We strongly recommend you to backup your keystore."
          _tags={transifexTags}
        />
      </Text>
      <ExtLink
        href={get("KeystoreBackupDocumentationUrl")}
        css={{ color: "#1EB9DB", fontSize: 14 }}
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
        css={{ width: 200, marginTop: 180 }}
        onClick={() => history.push("/lobby")}
      >
        <T _str="Done" _tags={transifexTags} />
      </Button>
    </Layout>
  );
}

export default observer(ActivationSuccessView);
