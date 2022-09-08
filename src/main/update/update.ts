import fs from "fs";
import { app, dialog, shell } from "electron";

import { IUpdateContext, checkCompatible } from "./check";
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

export async function update(
  context: IUpdateContext | null,
  updateOptions: IUpdateOptions
) {
  const win = updateOptions.getWindow();
  if (context) {
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
    if (!fs.existsSync(executePath)) {
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
}
