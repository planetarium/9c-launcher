import https from "https";
import path from "path";
import fs from "fs";

const VERSION_FILE_NAME = "version.json";
const playerPath = process.env.playerPath;
const baseUrl = process.env.baseUrl;
const os = process.env.os;
const playerVersionFilePath = path.join(playerPath, VERSION_FILE_NAME);
const defaultVersionData = { version: 1 };
let retryCount = 0;

checkForPlayerUpdate();
checkForLauncherUpdate();

setInterval(() => {
  checkForPlayerUpdate();
}, 60000);

setInterval(() => {
  checkForLauncherUpdate();
}, 300000);

function checkForPlayerUpdate() {
  sendLog("debug", "Check for player update");

  https
    .get(`${baseUrl}/player/latest.json`, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        const latest = JSON.parse(data);

        fs.readFile(playerVersionFilePath, (err, playerVersionData) => {
          const local = readLocalPlayerVersionFile(err, playerVersionData);

          checkPlayerVersion(latest, local);
        });
      });
    })
    .on("error", (error) => {
      sendLog("error", error.message);
    });
}

function checkForLauncherUpdate() {
  sendUpdateInfo("launcher", "", 0);
}

function readLocalPlayerVersionFile(err, playerVersionData) {
  if (err) {
    if (err.code === "ENOENT") {
      sendLog("log", `Not found version file Start update, err: ${err}`);
      return defaultVersionData;
    } else {
      sendLog("error", `Error reading local version file:, ${err}`);
      throw err;
    }
  }

  return JSON.parse(playerVersionData);
}

function checkPlayerVersion(latest, local) {
  if (latest.version > local.version || isOldVersionFile(local)) {
    for (const file of latest.files) {
      if (file.os === os) {
        handleTooManyRetry();
        sendUpdateInfo("player", `${baseUrl}/player/${file.path}`, file.size);
        retryCount += 1;
      }
    }
  }
}

function isOldVersionFile(local) {
  if (local.apvVersion && local.schemaVersion) return true;
  return false;
}

function handleTooManyRetry() {
  if (retryCount > 10) {
    const errorMessage = `The checkForPlayerUpdate function has been called more than ${retryCount} times, hence it will be skipped.`;
    sendLog("error", errorMessage);
    throw Error(errorMessage);
  }
}

function sendLog(level, body) {
  sendMessage("log", { level, body });
}

function sendUpdateInfo(target, path, size) {
  sendMessage(`${target} update`, { path, size });
}

function sendMessage(type, extra) {
  process.send?.({
    type,
    ...extra,
  });
}
