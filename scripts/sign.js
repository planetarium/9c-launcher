/* eslint @typescript-eslint/no-var-requires: "off" */
const child_process = require("child_process");
const path = require("path");

const rootPath = path.resolve(__dirname, "../");

exports.default = async function (configuration) {
  const OS = process.env.OS;
  const ESIGNER_CREDENTIAL_ID = process.env.ESIGNER_CREDENTIAL_ID;
  const ESIGNER_USERNAME = process.env.ESIGNER_USERNAME;
  const ESIGNER_PASSWORD = process.env.ESIGNER_PASSWORD;
  const ESIGNER_TOTP_SECRET = process.env.ESIGNER_TOTP_SECRET;

  const runner =
    OS === "windows"
      ? ".\\signing\\window-signing.bat"
      : "./signing/linux-signing.sh";
  var dirname = path.dirname(configuration.path);
  // var filename = path.basename(configuration.path);

  child_process.execSync(
    `${runner} ${ESIGNER_CREDENTIAL_ID} ${ESIGNER_USERNAME} ${ESIGNER_PASSWORD} ${ESIGNER_TOTP_SECRET} "${rootPath}" "${configuration.path}" "${dirname}"`,
    {
      stdio: "inherit",
    }
  );
};
