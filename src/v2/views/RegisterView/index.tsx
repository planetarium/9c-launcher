import React from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import TextField from "src/v2/components/ui/TextField";
import styles from "./styles.module.scss";
import H1 from "src/v2/components/ui/H1";
import Button from "src/v2/components/ui/Button";
import RetypePasswordForm from "src/v2/components/RetypePasswordForm";

function RegisterView() {
  return (
    <Layout sidebar className={styles.register}>
      <H1>Create your account</H1>
      <p style={{ marginBlockEnd: 54 }}>Please set your password only.</p>
      <TextField type="text" label="ID" readOnly />
      <RetypePasswordForm onSubmit={() => {}} useActivitionKey />
    </Layout>
  );
}

export default observer(RegisterView);
