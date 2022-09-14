import { IApv, ISimpleApv } from "src/interfaces/apv";
import { IDownloadUrls, getDownloadUrls } from "../../utils/url";
import Headless from "../headless/headless";
import { get as getConfig, baseUrl, netenv } from "../../config";
import { readVersion, exists as metafileExists } from "./metafile";

export class GetPeersApvFailedError extends Error {}

export interface IUpdate {
  updateRequired: boolean;
  newApv: ISimpleApv;
  oldApv: ISimpleApv;
  urls: IDownloadUrls;
}

const peerInfos = getConfig("PeerStrings");
const localApvToken = getConfig("AppProtocolVersion");
const trustedApvSigners = getConfig("TrustedAppProtocolVersionSigners");

export async function checkForUpdate(
  standalone: Headless,
  platform: NodeJS.Platform
): Promise<IUpdate> {
  let peersApv;
  try {
    peersApv = getPeersApv(standalone, peerInfos, trustedApvSigners);
  } catch (e) {
    console.error(`getPeersApv Error ocurred ${e}:\n`, e.stderr);
    throw e;
  }

  return checkForUpdateFromApv(standalone, peersApv, platform);
}

// FIXME: Could use overload function...
export async function checkForUpdateFromApv(
  standalone: Headless,
  peersApv: ISimpleApv,
  platform: NodeJS.Platform
): Promise<IUpdate> {
  const localApv = standalone.apv.analyze(localApvToken);

  return {
    updateRequired: peersApv.version > localApv.version,
    newApv: peersApv,
    oldApv: localApv,
    urls: getDownloadUrls(baseUrl, netenv, peersApv.version, platform),
  };
}

/**
 * Checks `CompatiblityVersion` to check if we can proceed with our updater.
 */
export function checkCompatiblity(
  peersApv: ISimpleApv,
  localApv: ISimpleApv
): boolean {
  const peersCompatVersion = BigInt(
    (peersApv.extra["CompatiblityVersion"] as string | number) ?? 0
  );
  const localCompatVersion = BigInt(
    (localApv.extra["CompatiblityVersion"] as string | number) ?? 0
  );

  return peersCompatVersion <= localCompatVersion;
}

export async function checkMetafile(newApvVersion: number, dir: string) {
  if (await metafileExists(dir)) {
    console.log(`Player exists. check version metafile`);

    const version = await readVersion(dir);

    console.log(
      `Player version: ${version.apvVersion}, New version: ${newApvVersion}`
    );

    if (version.apvVersion < newApvVersion) {
      console.log(`Player update required, Start player update`);

      return true;
    }
  } else {
    console.log(`Player not exists. Start player update`);
    return true;
  }

  return false;
}

function getPeersApv(
  standalone: Headless,
  peerInfos: string[],
  trustedApvSigners: string[]
): IApv {
  const peerApvToken = standalone.apv.query(peerInfos[0]);

  if (peerInfos.length < 1) throw new GetPeersApvFailedError(`Empty peerInfos`);
  if (peerApvToken == null)
    throw new GetPeersApvFailedError(
      `Empty peerApvToken, peerInfos: ${peerInfos}`
    );

  if (standalone.apv.verify(trustedApvSigners, peerApvToken)) {
    return standalone.apv.analyze(peerApvToken);
  } else {
    throw new GetPeersApvFailedError(
      `Ignore APV[${peerApvToken}] due to failure to validating.`
    );
  }
}
