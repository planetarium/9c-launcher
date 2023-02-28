import { observer } from "mobx-react";
import React, { useState } from "react";
import Layout from "src/renderer/components/core/Layout";
import { CSS } from "src/renderer/stitches.config";
import { ActivationKeySubview, CreateKeySubview } from "./subviews";

export type RegisterState =
  | "createKey"
  | "enterActivationCode"
  | "waitActivation";

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
      {state === "waitActivation" && <></>}
    </Layout>
  );
}

export default observer(RegisterView);
