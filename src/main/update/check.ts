import { IApv, ISimpleApv } from "src/interfaces/apv";
import { buildDownloadUrl } from "../../utils/url";
import Headless from "../headless/headless";
import { get as getConfig, baseUrl, netenv, playerPath } from "../../config";
import { readVersion, exists as metafileExists } from "./metafile";
import { decodeProjectVersion } from "../../utils/apv";

export class GetPeersApvFailedError extends Error {}
export class NoProjectVersionFoundError extends Error {}

export interface IUpdate {
  newApv: ISimpleApv;
  oldApv: ISimpleApv;
  projects: {
    [key in Project]: IProjectUpdate;
  };
}
export interface IProjectUpdate {
  updateRequired: boolean;
  projectVersion: string;
  url: string;
}

export type Project = "player" | "launcher";

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

  if (!info.projects.player.updateRequired) {
    console.log(`Not required player update, Check player path.`);

    info.projects.player.updateRequired = await checkMetafile(
      peersApv,
      playerPath
    );
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
    throw new NoProjectVersionFoundError("New player commit hash required");
  }

  console.log(`Player exists. check version metafile`);

  let metadata;
  try {
    metadata = await readVersion(dir);
  } catch (e) {
    console.error(
      `readVersion Error ocurred, Start player update ${e}:\n`,
      e.stderr
    );
    return true;
  }

  console.log(`metadata: ${metadata}, New Apv: ${newApv}`);

  const { version: existsVersion } = decodeProjectVersion(
    metadata.projectVersion
  );
  const { version: newVersion } = decodeProjectVersion(newApv.extra["player"]);

  return metadata.apvVersion < newApv.version || existsVersion < newVersion;
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
) {
  const keys: Project[] = ["player", "launcher"];
  const projects: Partial<Record<Project, IProjectUpdate>> = {};

  keys.forEach((project) => {
    if (!newApv.extra[project]) {
      throw new NoProjectVersionFoundError(
        `New ${project} commit hash required`
      );
    }

    const { version: oldVersion } = oldApv.extra[project]
      ? decodeProjectVersion(oldApv.extra[project])
      : { version: -1 };
    const { version: newVersion, commitHash: newCommit } = decodeProjectVersion(
      newApv.extra[project]
    );

    projects[project] = {
      projectVersion: newApv.extra[project],
      url: buildDownloadUrl(
        baseUrl,
        netenv,
        newApv,
        project,
        newCommit,
        platform
      ),
      updateRequired:
        oldApv.version < newApv.version ||
        (oldApv.version < newApv.version && oldVersion < newVersion),
    };
  });

  return { projects } as {
    projects: Required<Record<Project, IProjectUpdate>>;
  };
}
