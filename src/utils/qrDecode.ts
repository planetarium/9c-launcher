import fs from "fs";
import path from "path";
import decodeQR from "@paulmillr/qr/decode.js";
import { Bitmap } from "@paulmillr/qr";

export async function decodeQRCode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target!.result as string;

      img.onload = () => {
        const offscreenCanvas = new OffscreenCanvas(img.width, img.height);
        const ctx = offscreenCanvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to create canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        try {
          const keystore = decodeQR({
            height: imageData.height,
            width: imageData.width,
            data: imageData.data,
          });
          resolve(keystore);
        } catch (e) {
          reject(new Error("Invalid QR code"));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export async function checkAndSaveFile(
  dirPath: string,
  keystore: string,
  uuid: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const files = fs.readdirSync(dirPath);

      const fileExists = files.some((file) => file.includes(uuid));

      if (fileExists) {
        reject(new Error("This key already exists."));
        return;
      }

      const isoDate =
        new Date().toISOString().replace(/:/g, "-").slice(0, -5) + "Z";
      const fileName = `UTC--${isoDate}--${uuid}`;
      const filePath = path.join(dirPath, fileName);

      fs.writeFileSync(filePath, keystore);

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
