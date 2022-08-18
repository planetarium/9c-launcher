import { NotSupportedPlatformError } from "../exceptions/not-supported-platform";
import { decode, BencodexDict } from "bencodex";
import { DOWNLOAD_URI, get as getConfig } from "../../config";

export function getVersionNumberFromAPV(apv: string): number {
  const [version] = apv.split("/");
  return parseInt(version, 10);
}

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

  return `http://${DOWNLOAD_URI}/${env}/v${rc}/${project}/v${projectVersion}/${fn}`;
}

const FILENAME_MAP: { [k in NodeJS.Platform]: string | null } = {
  aix: null,
  android: null,
  darwin: "mac.tar.gz",
  freebsd: null,
  linux: null,
  openbsd: null,
  sunos: null,
  win32: "win.zip",
  cygwin: "win.zip",
  netbsd: null,
};
