import fs from "fs";
import { app, dialog, shell } from "electron";

import { IUpdateContext, checkCompatible } from "./check";
import { launcherUpdate } from "./launcher-update";
import { playerUpdate } from "./player-update";

import { WIN_GAME_PATH, EXECUTE_PATH } from "../../config";

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
  getWindow(): Electron.BrowserWindow | null;
}

const executePath = EXECUTE_PATH[process.platform] || WIN_GAME_PATH;

export async function update(
  context: IUpdateContext,
  updateOptions: IUpdateOptions
) {
  const win = updateOptions.getWindow();
  if (context.updateRequired) {
    if (!checkCompatible(context.newApv, context.oldApv)) {
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
  } else {
    const exists = await fs.promises.stat(executePath).catch(() => false);
    if (!exists) {
      await playerUpdate(context, win);
    }
  }
}
