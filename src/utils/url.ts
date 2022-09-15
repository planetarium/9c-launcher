import { NotSupportedPlatformError } from "../main/exceptions/not-supported-platform";

const MACOS_FILE_NAME = "macOS.tar.gz";
const LINUX_FILE_NAME = "Linux.tar.gz";
const WINDOWS_FILE_NAME = "Windows.zip";

export interface IDownloadUrls {
  launcher: string;
  player: string;
}

export function getDownloadUrls(
  baseUrl: string,
  netenv: string,
  apvVersion: number,
  platform: NodeJS.Platform,
  commitHash: {
    launcher: string;
    player: string;
  }
): IDownloadUrls {
  const launcherUrl = buildDownloadUrl(
    baseUrl,
    netenv,
    apvVersion,
    "launcher",
    commitHash.launcher,
    platform
  );
  const playerUrl = buildDownloadUrl(
    baseUrl,
    netenv,
    apvVersion,
    "player",
    commitHash.player,
    platform
  );

  return {
    launcher: launcherUrl,
    player: playerUrl,
  };
}

export function buildDownloadUrl(
  baseUrl: string,
  env: string,
  rc: number,
  project: "player" | "launcher",
  commitHash: string,
  platform: NodeJS.Platform
): string {
  const filename = BINARY_FILENAME_MAP[platform];

  if (filename === null) {
    throw new NotSupportedPlatformError(platform);
  }

  return [baseUrl, env, `v${rc}`, project, commitHash, filename].join("/");
}

export const BINARY_FILENAME_MAP: { [k in NodeJS.Platform]: string | null } = {
  aix: null,
  android: null,
  darwin: MACOS_FILE_NAME,
  freebsd: null,
  linux: LINUX_FILE_NAME,
  openbsd: null,
  sunos: null,
  win32: WINDOWS_FILE_NAME,
  cygwin: WINDOWS_FILE_NAME,
  netbsd: null,
};
