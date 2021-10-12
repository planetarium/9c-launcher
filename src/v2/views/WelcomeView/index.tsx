import React from "react";
import { observer } from "mobx-react";
import Layout from "../../components/core/Layout";

function WelcomeView() {
  return <Layout />;
}

export default observer(WelcomeView);
