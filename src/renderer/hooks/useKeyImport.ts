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

  const isValidFileName = (fileName: string) => {
    const utcRegex =
      /^UTC--\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z--[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.json$/i;
    return utcRegex.test(fileName);
  };

  //파일 형식 검증
  const isImageFile = (fileName: string) => {
    const imageExtensions = /\.(png|jpg|jpeg)$/i;
    return imageExtensions.test(fileName);
  };

  // 파일 안 내용 검증
  function validateWeb3SecretStorage(json: any): boolean {
    const schema: { [key: string]: any } = {
      version: "number",
      id: "string",
      address: "string",
      crypto: {
        ciphertext: "string",
        cipherparams: {
          iv: "string",
        },
        cipher: "string",
        kdf: "string",
        kdfparams: {
          c: "number",
          dklen: "number",
          prf: "string",
          salt: "string",
        },
        mac: "string",
      },
    };

    function validate(obj: any, schema: any): boolean {
      for (const key in schema) {
        if (typeof schema[key] === "object") {
          if (!obj[key] || typeof obj[key] !== "object") return false;
          if (!validate(obj[key], schema[key])) return false;
        } else if (typeof obj[key] !== schema[key]) {
          return false;
        }
      }
      return true;
    }

    return validate(json, schema);
  }

  const handleSubmit = async () => {
    let privateKey: RawPrivateKey;
    if (key.keyFile) {
      const fileName = key.keyFile.name;

      try {
        //qr디코딩 없이 일반 파일로 처리
        const keyFileText = await key.keyFile.text();
        let keystore;

        if (isImageFile(fileName)) {
          keystore = await decodeQRCode(key.keyFile);
        } else if (isValidFileName(fileName)) {
          try {
            JSON.parse(keyFileText);
          } catch (e) {
            setError(t("Invalid JSON format"));
            return;
          }

          // JSON 내용 검증
          if (!validateWeb3SecretStorage(JSON.parse(keyFileText))) {
            setError(t("Invalid keystore JSON"));
            return;
          }
          keystore = JSON.parse(keyFileText);
        } else {
          setError(t("Invalid keyFile text"));
          return;
        }

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
