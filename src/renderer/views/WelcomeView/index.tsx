import React from "react";
import { observer } from "mobx-react";

import { ButtonLink } from "src/renderer/components/ui/Button";
import Layout from "src/renderer/components/core/Layout";

import logo from "src/resources/logo.png";
import { CSS, styled } from "src/renderer/stitches.config";
import { T } from "src/renderer/i18n";
import { Link } from "src/renderer/components/ui/Link";

const welcomeStyles: CSS = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "& > * + *": {
    marginTop: "1rem",
  },
};

const Header = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: "$bold",
});

const Summary = styled("p", {
  lineHeight: 1.6,
  textAlign: "center",
});

const transifexTags = "v2/welcome";

function WelcomeView() {
  return (
    <Layout sidebar css={welcomeStyles}>
      <img src={logo} />
      <Header>
        <T _str="Welcome to Nine Chronicles!" _tags={transifexTags} />
      </Header>
      <Summary>
        <T
          _str={
            "It’s a fantasy world on the blockchain.\nThe eternal world with your cat begins now."
          }
          _tags={transifexTags}
        />
      </Summary>
      <ButtonLink variant="primary" to="/register">
        <T _str="Create New Account" _tags={transifexTags} />
      </ButtonLink>
      <Link to="/import">
        <T _str="I already have my account" _tags={transifexTags} />
      </Link>
    </Layout>
  );
}

export default observer(WelcomeView);
