import fs from "fs";
import lockfile from "lockfile";
import path from "path";
import { app, dialog, shell } from "electron";

import { IUpdate, checkCompatiblity } from "./check";
import { launcherUpdate } from "./launcher-update";
import { playerUpdate } from "./player-update";

import {
  DEFAULT_DOWNLOAD_BASE_URL,
  get as getConfig,
  WIN_GAME_PATH,
  EXECUTE_PATH,
  netenv,
  apvVersionNumber,
} from "../../config";
import { buildDownloadUrl } from "../../utils/url";

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
  getWindow(): Electron.BrowserWindow | null;
}

const baseURL = getConfig("DownloadBaseURL", DEFAULT_DOWNLOAD_BASE_URL);
const executePath = EXECUTE_PATH[process.platform] || WIN_GAME_PATH;

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");

export async function performUpdate(
  context: IUpdate | null,
  updateOptions: IUpdateOptions
) {
  if (lockfile.checkSync(lockfilePath)) {
    console.log(
      "'encounter different version' event seems running already. Stop this flow."
    );
    return;
  }

  try {
    lockfile.lockSync(lockfilePath);
    console.log(
      "Created 'encounter different version' lockfile at ",
      lockfilePath
    );
  } catch (e) {
    console.error("Error occurred during trying lock.");
    throw e;
  }

  const win = updateOptions.getWindow();

  if (context) {
    if (!checkCompatiblity(context.newApv, context.oldApv)) {
      console.log(
        `Stop update process. CompatiblityVersion is higher than current.`
      );
      win?.webContents.send("compatiblity-version-higher-than-current");
      if (win) {
        const { checkboxChecked } = await dialog.showMessageBox(win, {
          type: "error",
          message:
            "Nine Chronicles has been updated but the update needs reinstallation due to techincal issues. Sorry for inconvenience.",
          title: "Reinstallation required",
          checkboxChecked: true,
          checkboxLabel: "Open the installer page in browser",
        });
        if (checkboxChecked)
          shell.openExternal("https://bit.ly/9c-manual-update");
        app.exit(0);
      }
      return;
    }

    await launcherUpdate(context, updateOptions);
    await playerUpdate(context.urls.player, win);

    updateOptions.relaunchRequired();
  } else {
    const exists = await fs.promises.stat(executePath).catch(() => false);

    if (!exists) {
      await playerUpdate(
        buildDownloadUrl(
          baseURL,
          netenv,
          apvVersionNumber,
          "player",
          1,
          process.platform
        ),
        win
      );
    }
  }

  lockfile.unlockSync(lockfilePath);
  console.log(
    "Removed 'encounter different version' lockfile at ",
    lockfilePath
  );
}

export function isUpdating() {
  return lockfile.checkSync(lockfilePath);
}

/**
 * unlock if lockfile locked.
 */
export function cleanUpLockfile() {
  if (lockfile.checkSync(lockfilePath)) {
    lockfile.unlockSync(lockfilePath);
  }
}
