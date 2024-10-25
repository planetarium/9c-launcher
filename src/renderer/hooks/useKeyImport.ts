import { useState } from "react";
import { Address, RawPrivateKey } from "@planetarium/account";
import { ImportData } from "src/renderer/components/ImportInput";
import { checkAndSaveFile, decodeQRCode } from "src/utils/qrDecode";
import { getKeyStorePath } from "src/stores/account";
import { useStore } from "src/utils/useStore";
import { useHistory } from "react-router";
import { t } from "@transifex/native";

export default function useKeyImport() {
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

  return {
    key,
    setKey,
    error,
    handleSubmit,
    isKeyValid:
      (!key.key && !key.keyFile) ||
      (!!key.key && !account.isValidPrivateKey(key.key)),
  };
}
