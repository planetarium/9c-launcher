import extractZip from "extract-zip";
import * as utils from "../../utils";
import { tmpName } from "tmp-promise";
import { spawn as spawnPromise } from "child-process-promise";
import fs from "fs";


export async function winExtract(from: string, to: string, win: Electron.BrowserWindow) {
  const tempDir = await tmpName();

  // Unzip ZIP
  console.log("[player] Start to extract the zip archive", from, "to", tempDir);

  await extractZip(from, {
    dir: tempDir,
    onEntry: (_, zipfile) => {
      const progress = zipfile.entriesRead / zipfile.entryCount;
      win?.webContents.send("update extract progress", progress);
    },
  });
  win.webContents.send("update extract complete");
  console.log("[player] The zip archive", from, "has extracted to", tempDir);
  win.webContents.send("update copying progress");
  await utils.copyDir(tempDir, to);
  console.log("[player] Copied extracted files from", tempDir, "to", to);
  try {
    await fs.promises.rmdir(tempDir, { recursive: true });
    console.log("[player] Removed all temporary files from", tempDir);
  } catch (e) {
    console.warn("[player] Failed to remove temporary files from", tempDir, "\n", e);
  }
  win.webContents.send("update copying complete");
}

export async function macExtract(from: string, to: string, filename: string) {
  // untar .tar.{gz,bz2}
  const lowerFname = filename.toLowerCase();
  const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
  console.log(
    "[player] Start to extract the tarball archive",
    from,
    "to",
    to
  );
  try {
    await spawnPromise(
      "tar",
      [`xvf${bz2 ? "j" : "z"}`, from, "-C", to],
      { capture: ["stdout", "stderr"] }
    );
  } catch (e) {
    console.error(`${e}:\n`, e.stderr);
    throw e;
  }
  console.log(
    "[player] The tarball archive",
    from,
    "has extracted to ",
    to
  );
}
