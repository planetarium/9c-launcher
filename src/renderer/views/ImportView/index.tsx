import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { RawPrivateKey } from "@planetarium/account";
import Layout from "src/renderer/components/core/Layout";
import { T } from "src/renderer/i18n";
import H1 from "src/renderer/components/ui/H1";
import Button, { ButtonBar } from "src/renderer/components/ui/Button";
import H2 from "src/renderer/components/ui/H2";
import { useStore } from "src/utils/useStore";
import { useHistory } from "react-router";
import ImportInput, { ImportData } from "src/renderer/components/ImportInput";
import { t } from "@transifex/native";
import decodeQR from "@paulmillr/qr/decode.js";
import { Bitmap } from "@paulmillr/qr";

const transifexTags = "v2/import-view";

function ImportView() {
  const account = useStore("account");
  const history = useHistory();

  const [key, setKey] = useState<ImportData>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    let privateKey: RawPrivateKey;
    if (key.fromFile && key.keyFile) {
      try {
        // Create an image object
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.src = e.target!.result as string;

          img.onload = () => {
            // Create an invisible canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              setError(t("Failed to create canvas context"));
              return;
            }

            // Set canvas dimensions to image dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);

            // Get ImageData from the canvas
            const imageData = ctx.getImageData(0, 0, img.width, img.height);

            console.log(imageData.width, imageData.height);
            // Now you can pass the ImageData to decodeQR
            try {
              const a = decodeQR({
                height: imageData.height,
                width: imageData.width,
                data: imageData.data,
              });
              console.log(a);
            } catch (e) {
              console.log(e);
              setError(t("Invalid QR code"));
            }
          };

          img.onerror = (e) => {
            setError(t("Failed to load image"));
          };
        };

        reader.onerror = () => {
          setError(t("Failed to read file"));
        };

        reader.readAsDataURL(key.keyFile);
      } catch (e) {
        console.log(e);
        setError(t("Invalid QR code"));
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
    <Layout sidebar>
      <H1>
        <T _str="Register Your Key" _tags={transifexTags} />
      </H1>
      <H2>
        <T _str="Register your backed up key string." _tags={transifexTags} />
      </H2>
      {error && <p>{error}</p>}
      <ImportInput onSubmit={setKey} fromFile={key.fromFile} />
      <ButtonBar>
        <Button onClick={history.goBack.bind(history)}>
          <T _str="Prev" _tags={transifexTags} />
        </Button>
        <Button
          variant="primary"
          disabled={!key.key && !key.keyFile}
          onClick={handleSubmit}
        >
          <T _str="Next" _tags={transifexTags} />
        </Button>
      </ButtonBar>
    </Layout>
  );
}

export default observer(ImportView);
