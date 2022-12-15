import React from "react";
import { observer } from "mobx-react";
import { useStore } from "src/v2/utils/useStore";
import Layout from "src/v2/components/core/Layout";
import H1 from "src/v2/components/ui/H1";
import RetypePasswordForm from "src/v2/components/RetypePasswordForm";
import { useHistory } from "react-router";
import H2 from "src/v2/components/ui/H2";
import { T } from "src/renderer/i18n";

const transifexTags = "v2/recover-view";

function RecoverView() {
  const account = useStore("account");
  const address = account.selectedAddress;
  const history = useHistory();

  const onSubmit = ({ password }: { password: string }) => {
    try {
      account.removeV3ByAddress(address);
    } finally {
      account
        .getPrivateKeyAndForget()
        .then((privateKey) => account.importRaw(privateKey, password));
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
      <RetypePasswordForm address={address} onSubmit={onSubmit} />
    </Layout>
  );
}

export default observer(RecoverView);
