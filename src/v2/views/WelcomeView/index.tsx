import React from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";

import { ButtonLink } from "../../components/ui/Button";
import Layout from "../../components/core/Layout";

import logo from "../../resources/logo.png";

function WelcomeView() {
  return (
    <Layout sidebar className={styles.welcome}>
      <img src={logo} />
      <h1>Welcome to Nine Chronicles!</h1>
      <ButtonLink primary to="/register">
        Create New Account
      </ButtonLink>
    </Layout>
  );
}

export default observer(WelcomeView);
