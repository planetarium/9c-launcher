/* eslint-disable @typescript-eslint/no-var-requires */
// NOTE: This code has not been tested to work because the Xcode is not fully installed.

const packager = require("electron-packager");
const path = require("path");

const appleId = process.env.NC_BUILD_APPLE_ID || "";
const appleIdPassword = process.env.NC_BUILD_APPLE_ID_PASSWORD || "";

if (appleId === "") {
  console.warn("NC_BUILD_APPLE_ID is not set; singing macOS app will fail.");
}

if (appleIdPassword === "") {
  console.warn(
    "NC_BUILD_APPLE_ID_PASSWORD is not set; signing macOS app will fail."
  );
}

packager({
  dir: path.join(__dirname, "..", "dist"),
  out: path.join(__dirname, "..", "pack"),
  overwrite: true,
  icon: path.join(__dirname, "..", "icon.ico"),
  osxSign: {
    identity: "Developer ID Application: Swen Mun (LT94ZKYDCJ)",
    hardenedRuntime: true,
    entitlements: path.join(__dirname, "entitlements.plist"),
    "entitlements-inherit": path.join(__dirname, "entitlements.plist"),
    "signature-flags": "library",
  },
  osxNotarize: {
    appleId,
    appleIdPassword,
  },
  protocols: [
    {
      name: "Nine Chronicles Launcher",
      schemes: "ninechronicles-launcher",
    },
  ],
});
