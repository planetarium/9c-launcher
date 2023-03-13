import { observer } from "mobx-react";
import React from "react";
import { useHistory } from "react-router";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import Text from "src/renderer/components/ui/Text";
import { registerStyles } from ".";

function ActivationFailSubview() {
  const history = useHistory();

  return (
    <Layout sidebar css={registerStyles}>
      <H1>Activation has failed</H1>
      <Text css={{ fontSize: 14 }}>
        An unknown error has occurred.
        <br />
        Please make sure your activation code is valid or try again later.
      </Text>
      <Text css={{ fontSize: 14 }}>
        If you believe there is an issue, please contact via&nbsp;
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
        Retry
      </Button>
    </Layout>
  );
}

export default observer(ActivationFailSubview);
