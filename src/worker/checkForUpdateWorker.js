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

setTimeout(() => {
  checkForLauncherUpdate();
  checkForPlayerUpdate();
}, 1 * 1000);

setInterval(() => {
  checkForPlayerUpdate();
}, 60 * 1000);

setInterval(() => {
  checkForLauncherUpdate();
}, 60 * 5 * 1000);

async function checkForPlayerUpdate() {
  sendLog("debug", "Check for player update");

  let response;
  try {
    response = await https.get(`${baseUrl}/player/latest.json`);
  } catch(err) {
    sendLog("error", err.message);
    return;
  }
  let data = "";

  response.on("data", (chunk) => {
    data += chunk;
  });

  response.on("end", () => {
    const latest = JSON.parse(data);

    readLocalPlayerVersionFile().then((local) => {
      checkPlayerVersion(latest, local);
    });
  });
}

function checkForLauncherUpdate() {
  sendUpdateInfo("launcher", "", 0);
}

async function readLocalPlayerVersionFile() {
  let local;
  try {
    const playerVersionData = await fs.promises.readFile(playerVersionFilePath);
    local = JSON.parse(playerVersionData);
  } catch(err) {
    local = handleLocalPlayerVersionFileNotExistsError(err);
  }
  return local;
}

function handleLocalPlayerVersionFileNotExistsError(err) {
  if (err) {
    if (err.code === "ENOENT") {
      sendLog("log", `Not found version file Start update, err: ${err}`);
      return defaultVersionData;
    } else {
      sendLog("error", `Error reading local version file:, ${err}`);
      throw err;
    }
  }
  throw err;
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
