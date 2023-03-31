import { observer } from "mobx-react";
import React from "react";
import { useHistory } from "react-router";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import Text from "src/renderer/components/ui/Text";
import { T } from "src/renderer/i18n";
import { registerStyles } from ".";

const transifexTags = "v2/views/register/ActivationFailView";

function ActivationFailView() {
  const history = useHistory();

  return (
    <Layout sidebar css={registerStyles}>
      <H1>
        <T _str="Activation has failed" _tags={transifexTags} />
      </H1>
      <Text css={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
        <T
          _str="An unknown error has occurred.\nPlease make sure your activation code is valid or try again later."
          _tags={transifexTags}
        />
      </Text>
      <Text css={{ fontSize: 14 }}>
        <T
          _str="If you believe there is an issue, please contact via"
          _tags={transifexTags}
        />
        &nbsp;
        <ExtLink href={get("DiscordUrl")} css={{ color: "#1EB9DB" }}>
          Discord
        </ExtLink>
        .
      </Text>
      <Button
        layout
        variant="primary"
        centered
        css={{ width: 200, marginTop: 160 }}
        onClick={() => history.push("/register/activationKey")}
      >
        <T _str="Retry" _tags={transifexTags} />
      </Button>
    </Layout>
  );
}

export default observer(ActivationFailView);
