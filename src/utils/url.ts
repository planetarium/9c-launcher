import { NotSupportedPlatformError } from "src/main/exceptions/not-supported-platform";

export interface IDownloadUrls {
  launcher: string;
  player: string;
}

export function getDownloadUrls(
  baseUrl: string,
  netenv: string,
  apvVersion: number,
  platform: NodeJS.Platform
): IDownloadUrls {
  // TODO: fix project version number hard coding: 1.
  const launcherUrl = buildDownloadUrl(
    baseUrl,
    netenv,
    apvVersion,
    "launcher",
    1,
    platform
  );
  const playerUrl = buildDownloadUrl(
    baseUrl,
    netenv,
    apvVersion,
    "player",
    1,
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
  projectVersion: number,
  platform: NodeJS.Platform
): string {
  const fn = BINARY_FILENAME_MAP[platform];

  if (fn === null) {
    throw new NotSupportedPlatformError(platform);
  }

  return `${baseUrl}/${env}/v${rc}/${project}/v${projectVersion}/${fn}`;
}

export const BINARY_FILENAME_MAP: { [k in NodeJS.Platform]: string | null } = {
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
