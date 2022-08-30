import { NotSupportedPlatformError } from "../exceptions/not-supported-platform";
import { decode, BencodexDict } from "bencodex";
import { DEFAULT_DOWNLOAD_BASE_URL, get as getConfig } from "../../config";
import path from "path";
import { app } from "electron";
import fs from "fs";

export function decodeLocalAPV(): BencodexDict | undefined {
  const localApvToken = getConfig("AppProtocolVersion");
  const extra = Buffer.from(localApvToken.split("/")[1], "hex");

  if (!extra.length) return;

  return decode(extra) as BencodexDict | undefined;
}

export function getDownloadUrl(
  env: string,
  rc: number,
  project: "player" | "launcher",
  projectVersion: number,
  platform: NodeJS.Platform
): string {
  const fn = FILENAME_MAP[platform];

  if (fn === null) {
    throw new NotSupportedPlatformError(platform);
  }

  const baseURL = getConfig("DownloadBaseURL") || DEFAULT_DOWNLOAD_BASE_URL;

  return `${baseURL}/${env}/v${rc}/${project}/v${projectVersion}/${fn}`;
}

const FILENAME_MAP: { [k in NodeJS.Platform]: string | null } = {
  aix: null,
  android: null,
  darwin: "macOS.tar.gz",
  freebsd: null,
  linux: "Linux.tar.gz",
  openbsd: null,
  sunos: null,
  win32: "Windows.zip",
  cygwin: "Windows.zip",
  netbsd: null,
};

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
