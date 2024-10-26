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

  // 파일 이름 정규식으로 검증
  const isValidFileName = (fileName: string) => {
    const regex = /^[a-z0-9]{3,15}\.(txt|json)$/;
    return regex.test(fileName);
  };

  //파일 형식 검증
  const isImageFile = (fileName: string) => {
    const imageExtensions = /\.(png|jpg|jpeg|gif)$/i;
    return imageExtensions.test(fileName);
  };

  const handleSubmit = async () => {
    let privateKey: RawPrivateKey;
    if (key.keyFile) {
      // QR 디코딩을 사용하지 않고 파일을 그대로
      const fileName = key.keyFile.name;

      //
      if (!isValidFileName(fileName)) {
        setError(t("Invalid file name format."));
        return;
      }

      try {
        //qr디코딩 없이 일반 파일로 처리
        const keystore = await key.keyFile.text();

        //이미지 파일일 경우 qr코드 디코드
        if (isImageFile(fileName)) {
          const keystore = await decodeQRCode(key.keyFile);
        }

        // JSON 검증
        try {
          JSON.parse(keystore);
        } catch (e) {
          setError(t("Invalid JSON format in the file."));
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
