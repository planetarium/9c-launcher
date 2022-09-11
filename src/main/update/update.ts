import fs from "fs";
import { app, dialog, shell } from "electron";

import { IUpdateContext, checkCompatible } from "./check";
import { launcherUpdate } from "./launcher-update";
import { playerUpdate } from "./player-update";

import { playerPath } from "../../config";
import { FILE_NAME as METAFILE_NAME, readVersionMetafile } from "./metafile";

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
  getWindow(): Electron.BrowserWindow | null;
}

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

    console.log(`Update Required. start launcher update`);
    await launcherUpdate(context, updateOptions);
  } else {
    console.log(`Update not required. check player version file`);

    const exists = await fs.promises
      .stat(`${playerPath}/${METAFILE_NAME}`)
      .catch(() => false);
    if (exists) {
      const versionData = await readVersionMetafile(playerPath);
      if (versionData.apvVersion < context.newApv.version)
        await playerUpdate(context, win);
    } else {
      await playerUpdate(context, win);
    }
  }
}
