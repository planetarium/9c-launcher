import { IApv, ISimpleApv } from "src/interfaces/apv";
import { buildDownloadUrl } from "../../utils/url";
import Headless from "../headless/headless";
import { get as getConfig, baseUrl, netenv, playerPath } from "../../config";
import { readVersion, exists as metafileExists } from "./metafile";

export class GetPeersApvFailedError extends Error {}
export class NewCommitHashNotFoundError extends Error {}

export interface IUpdate {
  newApv: ISimpleApv;
  oldApv: ISimpleApv;
  player: IProjectUpdate;
  launcher: IProjectUpdate;
}
export interface IProjectUpdate {
  updateRequired: boolean;
  commitHash: string;
  url: string;
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

export async function checkForUpdateFromApv(
  standalone: Headless,
  peersApv: ISimpleApv,
  platform: NodeJS.Platform
): Promise<IUpdate> {
  const localApv = standalone.apv.analyze(localApvToken);

  const info = analyzeApvExtra(peersApv, localApv, platform);

  if (!info.player.updateRequired) {
    console.log(`Not required player update, Check player path.`);

    info.player.updateRequired = await checkMetafile(peersApv, playerPath);
  }

  return {
    newApv: peersApv,
    oldApv: localApv,
    ...info,
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

export async function checkMetafile(newApv: ISimpleApv, dir: string) {
  if (!(await metafileExists(dir))) {
    console.log(`Player not exists. Start player update`);
    return true;
  }
  if (!newApv.extra["player"]) {
    throw new NewCommitHashNotFoundError("New player commit hash required");
  }

  console.log(`Player exists. check version metafile`);

  let version;
  try {
    version = await readVersion(dir);
  } catch (e) {
    console.error(
      `readVersion Error ocurred, Start player update ${e}:\n`,
      e.stderr
    );
    return true;
  }

  console.log(
    `User's player version: ${version.commitHash}, New version: ${newApv.extra["player"]}`
  );

  if (newApv.extra["player"] !== version.commitHash) {
    console.log(`Player update required, Start player update`);

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

function analyzeApvExtra(
  newApv: ISimpleApv,
  oldApv: ISimpleApv,
  platform: NodeJS.Platform
): {
  player: IProjectUpdate;
  launcher: IProjectUpdate;
} {
  const keys: ("player" | "launcher")[] = ["player", "launcher"];
  const result = {
    player: {},
    launcher: {},
  };

  keys.forEach((project) => {
    const oldCommit = oldApv.extra[project];
    const newCommit = newApv.extra[project];

    if (!newCommit) {
      throw new NewCommitHashNotFoundError(
        `New ${project} commit hash required`
      );
    }

    result[project] = {
      commitHash: newCommit,
      url: buildDownloadUrl(
        baseUrl,
        netenv,
        newApv.version,
        project,
        newCommit,
        platform
      ),
      updateRequired: oldCommit !== newCommit,
    };
  });

  // Will this be right...?
  return result as {
    player: IProjectUpdate;
    launcher: IProjectUpdate;
  };
}
