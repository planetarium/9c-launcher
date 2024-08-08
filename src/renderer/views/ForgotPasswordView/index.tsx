import React, { useState } from "react";
import { observer } from "mobx-react";
import { Address, RawPrivateKey } from "@planetarium/account";
import Layout from "src/renderer/components/core/Layout";
import H1 from "src/renderer/components/ui/H1";
import { T } from "src/renderer/i18n";
import Button, { ButtonBar } from "src/renderer/components/ui/Button";
import H2 from "src/renderer/components/ui/H2";
import { t } from "@transifex/native";
import { Link } from "src/renderer/components/ui/Link";
import { useStore } from "src/utils/useStore";
import { useHistory } from "react-router";
import ImportInput, { ImportData } from "src/renderer/components/ImportInput";
import { checkAndSaveFile, decodeQRCode } from "src/utils/qrDecode";
import { getKeyStorePath } from "src/stores/account";

const transifexTags = "v2/ForgotPasswordView";
function ForgotPasswordView() {
  const account = useStore("account");
  const history = useHistory();

  const [key, setKey] = useState<ImportData>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    let privateKey: RawPrivateKey;
    if (key.keyFile) {
      try {
        const keystore = await decodeQRCode(key.keyFile);
        const { id, address }: { id: string; address: string } =
          JSON.parse(keystore);
        try {
          await checkAndSaveFile(await getKeyStorePath(), keystore, id);
        } catch (e) {
          console.log(e);
          setError(t(e.message));
          return;
        }
        account.addAddress(Address.fromHex("0x" + address, true));
        history.push("/login");
      } catch (e) {
        console.log(e);
        setError(t(e.message));
        return;
      }
    } else {
      try {
        privateKey = RawPrivateKey.fromHex(key.key!);
      } catch (e) {
        setError(t("Invalid private key"));
        return;
      }

      account.beginRecovery(privateKey);
      history.push("/recover");
    }
  };

  return (
    <Layout sidebar flex>
      <H1>
        <T _str="Input your private key" _tags={transifexTags} />
      </H1>
      <H2>
        <T
          _str="Enter your private key to reset your password."
          _tags={transifexTags}
        />
      </H2>
      {error && <p>{error}</p>}
      <ImportInput
        onSubmit={setKey}
        fromFile={key.fromFile}
        invalid={!!key.key && !account.isValidPrivateKey(key.key ?? "")}
      />
      <ButtonBar>
        <Button onClick={history.goBack.bind(history)}>
          <T _str="Prev" _tags={transifexTags} />
        </Button>
        <Button
          variant="primary"
          disabled={
            (!key.key && !key.keyFile) ||
            (!!key.key && !account.isValidPrivateKey(key.key))
          }
          onClick={handleSubmit}
        >
          <T _str="Next" _tags={transifexTags} />
        </Button>
      </ButtonBar>
      <Link centered to="/revoke">
        <T _str="Got no keys?" _tags={transifexTags} />
      </Link>
    </Layout>
  );
}

export default observer(ForgotPasswordView);
