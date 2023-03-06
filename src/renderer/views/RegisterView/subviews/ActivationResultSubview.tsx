import React from "react";
import { useHistory } from "react-router";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
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
      <p>You can now begin your journey. Click Start to play the game.</p>
      <TextField label="Your Nine Chronicles address" value={account.address} />
      <p>Note: We strongly recommend you to backup your keystore.</p>
      <Button
        layout
        variant="primary"
        centered
        css={{ width: 200 }}
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
      {/* TODO: Add description here */}
      <p>Whoa it failed</p>
      <Button
        layout
        variant="primary"
        centered
        css={{ width: 200 }}
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
