import React from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";

import Button from "../../components/ui/Button";
import Layout from "../../components/core/Layout";

import logo from "../../resources/logo.png";

function WelcomeView() {
  return (
    <Layout sidebar className={styles.welcome}>
      <img src={logo} />
      <h1>Welcome to Nine Chronicles!</h1>
      <Button primary>Create New Account</Button>
    </Layout>
  );
}

export default observer(WelcomeView);
