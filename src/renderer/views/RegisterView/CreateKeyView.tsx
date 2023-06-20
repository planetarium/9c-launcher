import { utils } from "@noble/secp256k1";
import { observer } from "mobx-react";
import React from "react";
import { useHistory } from "react-router";
import Layout from "src/renderer/components/core/Layout";
import RetypePasswordForm, {
  FormData,
} from "src/renderer/components/RetypePasswordForm";
import H1 from "src/renderer/components/ui/H1";
import { T } from "src/renderer/i18n";
import { useStore } from "src/utils/useStore";
import { registerStyles } from ".";
import { Web3Account } from "@planetarium/account-web3-secret-storage";

const transifexTags = "v2/views/register/CreateKeyView";

function CreateKeyView() {
  const history = useHistory();

  const accountStore = useStore("account");

  const onPasswordSubmit = async ({ password }: FormData) => {
    const account: Web3Account = await accountStore.importRaw(
      utils.bytesToHex(utils.randomPrivateKey()),
      password
    );

    await accountStore.login(account, password);

    history.push("/register/getPatron");
  };

  return (
    <Layout sidebar flex css={registerStyles}>
      <H1>Create your address </H1>
      <p>
        <T
          _str="Please set a password for your address to continue. Your address will be generated after this step."
          _tags={transifexTags}
        />
      </p>
      <RetypePasswordForm onSubmit={onPasswordSubmit} />
    </Layout>
  );
}

export default observer(CreateKeyView);
