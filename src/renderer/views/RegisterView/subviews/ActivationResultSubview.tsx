import React from "react";
import { useHistory } from "react-router";
import { get } from "src/config";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import Text from "src/renderer/components/ui/Text";
import TextField from "src/renderer/components/ui/TextField";
import { useLoginSession } from "src/utils/useLoginSession";
import { RegisterState } from "..";

type ResultProps = {
  setState: (state: RegisterState) => void;
};

type Props = {
  result: boolean;
} & ResultProps;

function ActivationSuccessSubview({ setState }: ResultProps) {
  const history = useHistory();

  const account = useLoginSession();

  return (
    <>
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
        Start
      </Button>
    </>
  );
}

function ActivationFailSubview({ setState }: ResultProps) {
  return (
    <>
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
        onClick={() => setState("enterActivationCode")}
      >
        Retry
      </Button>
    </>
  );
}

function ActivationResultSubview({ result, ...resultProps }: Props) {
  return result ? (
    <ActivationSuccessSubview {...resultProps} />
  ) : (
    <ActivationFailSubview {...resultProps} />
  );
}

export default ActivationResultSubview;
