import { IApv, ISimpleApv } from "src/interfaces/apv";
import { IDownloadUrls, getDownloadUrls } from "../../utils/url";
import Headless from "../headless/headless";

export class GetPeersApvFailedError extends Error {}

export interface IUpdateContext {
  updateRequired: boolean;
  newApv: ISimpleApv;
  oldApv: ISimpleApv;
  urls: IDownloadUrls;
}

export async function checkUpdateRequired(
  standalone: Headless,
  platform: NodeJS.Platform,
  // TODO: should make config object
  netenv: string,
  peerInfos: string[],
  baseUrl: string,
  localApvToken: string,
  trustedApvSigners: string[]
): Promise<IUpdateContext> {
  const peersApv = await getPeersApv(standalone, peerInfos, trustedApvSigners);
  const localApv = await getLocalApv(standalone, localApvToken);

  return {
    updateRequired: updateRequired(peersApv.version, localApv.version),
    newApv: peersApv,
    oldApv: localApv,
    urls: getDownloadUrls(baseUrl, netenv, peersApv.version, platform),
  };
}

// FIXME: Could use overload function...
export async function checkUpdateRequiredUsedPeersApv(
  peersApv: ISimpleApv,
  standalone: Headless,
  platform: NodeJS.Platform,
  netenv: string,
  baseUrl: string,
  localApvToken: string
): Promise<IUpdateContext> {
  const localApv = await getLocalApv(standalone, localApvToken);

  return {
    updateRequired: updateRequired(peersApv.version, localApv.version),
    newApv: peersApv,
    oldApv: localApv,
    urls: getDownloadUrls(baseUrl, netenv, peersApv.version, platform),
  };
}

export function checkCompatible(
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

async function getPeersApv(
  standalone: Headless,
  peerInfos: string[],
  trustedApvSigners: string[]
): Promise<IApv> {
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

async function getLocalApv(standalone: Headless, token: string): Promise<IApv> {
  return standalone.apv.analyze(token);
}

function updateRequired(peersApvVersion: number, localApvVersion: number) {
  return peersApvVersion > localApvVersion;
}
