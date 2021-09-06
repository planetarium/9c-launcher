import React from "react";
import { observer } from "mobx-react";

import { ButtonLink } from "../../components/ui/Button";
import Layout from "../../components/core/Layout";

import logo from "../../resources/logo.png";
import { CSS } from "src/v2/stitches.config";

const welcomeStyles: CSS = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "& > * + *": {
    marginTop: "1rem",
  },
};

function WelcomeView() {
  return (
    <Layout sidebar css={welcomeStyles}>
      <img src={logo} />
      <h1>Welcome to Nine Chronicles!</h1>
      <ButtonLink type="primary" to="/register">
        Create New Account
      </ButtonLink>
    </Layout>
  );
}

export default observer(WelcomeView);
