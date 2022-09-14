import lockfile from "lockfile";
import path from "path";
import { app, dialog, shell } from "electron";

import { IUpdate, checkCompatiblity, checkMetafile } from "./check";
import { launcherUpdate } from "./launcher-update";
import { playerUpdate } from "./player-update";
import { playerPath } from "src/config";

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
  getWindow(): Electron.BrowserWindow | null;
}

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");

export async function performUpdate(
  update: IUpdate,
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

  if (update.updateRequired) {
    console.log(`Start launcher update, First check compatiblity.`);

    if (!checkCompatiblity(update.newApv, update.oldApv)) {
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

    await launcherUpdate(update, updateOptions);
    await playerUpdate(update, win);

    updateOptions.relaunchRequired();
  } else {
    console.log(`Not required launcher update, Check player path.`);

    if (await checkMetafile(update.newApv.version, playerPath)) {
      await playerUpdate(update, win);
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
