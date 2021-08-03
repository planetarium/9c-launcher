import React from "react";
import { observer } from "mobx-react";
import Layout from "../../components/core/Layout";

function LoginView() {
  return <Layout sidebar />;
}

export default observer(LoginView);
