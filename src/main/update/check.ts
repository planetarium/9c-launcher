import { IApv, ISimpleApv } from "src/interfaces/apv";
import { IDownloadUrls, getDownloadUrls } from "../../utils/url";
import Headless from "../headless/headless";
import { get as getConfig, baseUrl, netenv } from "../../config";

export class GetPeersApvFailedError extends Error {}

export interface IUpdateContext {
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
): Promise<IUpdateContext | null> {
  let peersApv;
  try {
    peersApv = getPeersApv(standalone, peerInfos, trustedApvSigners);
  } catch (e) {
    console.error(`getPeersApv Error ocurred ${e}:\n`, e.stderr);
    return null;
  }

  const localApv = standalone.apv.analyze(localApvToken);

  if (peersApv.version > localApv.version)
    return {
      newApv: peersApv,
      oldApv: localApv,
      urls: getDownloadUrls(baseUrl, netenv, peersApv.version, platform),
    };

  return null;
}

// FIXME: Could use overload function...
export async function checkForUpdateUsedPeersApv(
  standalone: Headless,
  peersApv: ISimpleApv,
  platform: NodeJS.Platform
): Promise<IUpdateContext | null> {
  const localApv = standalone.apv.analyze(localApvToken);

  if (peersApv.version > localApv.version)
    return {
      newApv: peersApv,
      oldApv: localApv,
      urls: getDownloadUrls(baseUrl, netenv, peersApv.version, platform),
    };

  return null;
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

  if (peersCompatVersion > localCompatVersion) return false;

  return true;
}

function getPeersApv(
  standalone: Headless,
  peerInfos: string[],
  trustedApvSigners: string[]
): IApv {
  if (peerInfos.length > 0) {
    const peerApvToken = standalone.apv.query(peerInfos[0]);

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

  throw new GetPeersApvFailedError(`Empty peerInfos`);
}
