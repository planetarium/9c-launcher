import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import fs from "fs";
import {
  EXECUTE_PATH,
  LEGACY_EXECUTE_PATH,
  LEGACY_WIN_GAME_PATH,
  WIN_GAME_PATH,
} from "./config";

export function execute(
  binarypath: string,
  args: string[],
): ChildProcessWithoutNullStreams {
  if (binarypath == "") {
    throw Error("Path is empty.");
  }

  const node = spawn(binarypath, args);
  node.stdout?.on("data", (data) => {
    console.log(`${data}`);
  });
  node.stderr?.on("data", (data) => {
    console.log(`${data}`);
  });
  return node;
}

export async function copyDir(srcDir: string, dstDir: string): Promise<void> {
  try {
    const stat = await fs.promises.stat(dstDir);

    if (!stat.isDirectory()) {
      await fs.promises.unlink(dstDir);
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      await fs.promises.mkdir(dstDir, { recursive: true });
    }
  }

  for (const ent of await fs.promises.readdir(srcDir, {
    withFileTypes: true,
  })) {
    const src = path.join(srcDir, ent.name);
    const dst = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      await copyDir(src, dst);
    } else {
      try {
        await fs.promises.copyFile(src, dst);
      } catch (e) {
        console.warn("Failed to copy a file", src, "->", dst, ":\n", e);
      }
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getExecutePath() {
  const defaultPath = EXECUTE_PATH[process.platform] ?? WIN_GAME_PATH;
  const legacyPath =
    LEGACY_EXECUTE_PATH[process.platform] ?? LEGACY_WIN_GAME_PATH;

  if (fs.existsSync(defaultPath)) return defaultPath;
  if (fs.existsSync(legacyPath)) return legacyPath;

  console.error("Player Binary Not Exists. Trigger Player Update.");
  return "PLAYER_UPDATE";
}
