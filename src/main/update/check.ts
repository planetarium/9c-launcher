import { IApv } from "src/interfaces/apv";
import Headless from "../headless/headless";
import { NotSupportedPlatformError } from "../exceptions/not-supported-platform";

export class GetPeersApvFailedError extends Error {}

export interface DownloadInfo {
  launcher: string;
  player: string;
}

export default async function checkForUpdates(
  standalone: Headless,
  // FIXME: should make config object
  platform: NodeJS.Platform,
  netenv: string,
  peerInfos: string[],
  baseUrl: string,
  localApvToken: string,
  trustedApvSigners: string[]
): Promise<DownloadInfo | null> {
  const peersApv = getPeersApv(standalone, peerInfos, trustedApvSigners);
  const localApv = getLocalApv(standalone, localApvToken);

  if (updateRequired(peersApv.version, localApv.version)) {
    // FIXME: project version number hard coding: 1.
    const launcherUrl = buildDownloadUrl(
      baseUrl,
      netenv,
      peersApv.version,
      "launcher",
      1,
      platform
    );
    const playerUrl = buildDownloadUrl(
      baseUrl,
      netenv,
      peersApv.version,
      "player",
      1,
      platform
    );

    return {
      launcher: launcherUrl,
      player: playerUrl,
    };
  }

  return null;
}

function getPeersApv(
  standalone: Headless,
  peerInfos: string[],
  trustedApvSigners: string[]
): IApv {
  if (peerInfos.length > 0) {
    const peerApvToken = standalone.apv.query(peerInfos[0]);

    if (peerApvToken !== null) {
      if (standalone.apv.verify(trustedApvSigners, peerApvToken)) {
        return standalone.apv.analyze(peerApvToken);
      } else {
        throw new GetPeersApvFailedError(
          `Ignore APV[${peerApvToken}] due to failure to validating.`
        );
      }
    }

    throw new GetPeersApvFailedError(
      `Empty peerApvToken, peerInfos: ${peerInfos}`
    );
  }

  throw new GetPeersApvFailedError(`Empty peerInfos`);
}

function getLocalApv(standalone: Headless, token: string): IApv {
  return standalone.apv.analyze(token);
}

function updateRequired(peersApvVersion: number, localApvVersion: number) {
  return peersApvVersion > localApvVersion;
}

function buildDownloadUrl(
  baseUrl: string,
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

  return `${baseUrl}/${env}/v${rc}/${project}/v${projectVersion}/${fn}`;
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
