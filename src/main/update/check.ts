import { IApv, ISimpleApv } from "src/interfaces/apv";
import { IDownloadUrls, getDownloadUrls } from "../../utils/url";
import Headless from "../headless/headless";
import { get as getConfig, baseUrl, netenv } from "../../config";

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
