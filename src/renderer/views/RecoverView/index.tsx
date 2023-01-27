import React from "react";
import { observer } from "mobx-react";
import { useStore } from "src/utils/useStore";
import Layout from "src/renderer/components/core/Layout";
import H1 from "src/renderer/components/ui/H1";
import RetypePasswordForm from "src/renderer/components/RetypePasswordForm";
import { useHistory } from "react-router";
import H2 from "src/renderer/components/ui/H2";
import { T } from "src/renderer/i18n";

const transifexTags = "v2/recover-view";

function RecoverView() {
  const accountStore = useStore("account");
  const history = useHistory();

  const onSubmit = async ({ password }: { password: string }) => {
    try {
      const newAccount = await accountStore.completeRecovery(password);
      await accountStore.login(newAccount, password);
    } finally {
      history.push("/");
    }
  };

  return (
    <Layout sidebar>
      <H1>
        <T _str="Type your new password" _tags={transifexTags} />
      </H1>
      <H2>
        <T _str="Found your account!" _tags={transifexTags} />
      </H2>
      <RetypePasswordForm onSubmit={onSubmit} />
    </Layout>
  );
}

export default observer(RecoverView);
