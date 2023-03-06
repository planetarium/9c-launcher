import { observer } from "mobx-react";
import React, { useState } from "react";
import Layout from "src/renderer/components/core/Layout";
import { CSS } from "src/renderer/stitches.config";
import {
  ActivationKeySubview,
  ActivationResultSubview,
  ActivationWaitSubview,
  CreateKeySubview,
} from "./subviews";

export type RegisterState =
  | "createKey"
  | "enterActivationCode"
  | "waitActivation"
  | "activationSuccess"
  | "activationFailed";

const registerStyles: CSS = {
  padding: 52,
  boxSizing: "border-box",
  "& > * + *": {
    marginTop: "1rem",
  },
};

function RegisterView() {
  const [state, setState] = useState<RegisterState>("createKey");

  return (
    <Layout sidebar css={registerStyles}>
      {state === "createKey" && <CreateKeySubview setState={setState} />}
      {state === "enterActivationCode" && (
        <ActivationKeySubview setState={setState} />
      )}
      {state === "waitActivation" && (
        <ActivationWaitSubview setState={setState} />
      )}
      {state === "activationSuccess" && (
        <ActivationResultSubview result={true} setState={setState} />
      )}
      {state === "activationFailed" && (
        <ActivationResultSubview result={false} setState={setState} />
      )}
    </Layout>
  );
}

export default observer(RegisterView);
