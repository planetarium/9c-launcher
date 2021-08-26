import React from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import TextField from "src/v2/components/ui/TextField";
import styles from "./styles.module.scss";

function RegisterView() {
  return (
    <Layout sidebar className={styles.register}>
      <h1>Register</h1>
      <TextField type="text" label="ID" />
    </Layout>
  );
}

export default observer(RegisterView);
