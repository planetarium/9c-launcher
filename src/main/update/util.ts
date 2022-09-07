import path from "path";
import { app } from "electron";
import fs from "fs";

export async function cleanupOldPlayer() {
  const OLD_MAC_GAME_PATH = "9c.app/Contents/MacOS/9c";
  const OLD_WIN_GAME_PATH = "9c.exe";
  const OLD_LINUX_GAME_PATH = "9c";

  const oldPlayerPath = path.join(
    app.getAppPath(),
    process.platform === "darwin"
      ? OLD_MAC_GAME_PATH
      : process.platform === "linux"
      ? OLD_LINUX_GAME_PATH
      : OLD_WIN_GAME_PATH
  );

  try {
    await fs.promises.unlink(oldPlayerPath);
  } catch (e) {
    console.error("Player not found", e);
  }
}
