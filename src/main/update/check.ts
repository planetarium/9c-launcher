import { IApv, ISimpleApv } from "src/interfaces/apv";
import { buildDownloadUrl } from "../../utils/url";
import Headless from "../headless/headless";
import { get as getConfig, baseUrl, netenv, playerPath } from "../../config";
import { readVersion, exists as metafileExists } from "./metafile";
import { decodeProjectVersion } from "../../utils/apv";
import { version } from "process";

export class GetPeersApvFailedError extends Error {}
export class NewProjectVersionFoundError extends Error {}

export interface IUpdate {
  newApv: ISimpleApv;
  oldApv: ISimpleApv;
  player: IProjectUpdate;
  launcher: IProjectUpdate;
}
export interface IProjectUpdate {
  updateRequired: boolean;
  projectVersion: string;
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
  if (peersApv.version == 100291) {
    peersApv = {
      raw: "100291/54684Ac4ee5B933e72144C4968BEa26056880d71/MEUCIQCXu4pBDyH4qhn5KkgzoNGUFVGQixmbXThUy54xFPPQUwIgKQz8BTGyN5674Ir0HGSccP3aK7LCKlqn2t+BsEi5kY8=/ZHU4OmxhdW5jaGVydTQyOjEvNTFlODE0OWYwNDI1YzJiNTc2NzRiOTc0ZmU3YjY0NWQxNDZmYTAyZnU2OnBsYXllcnU0MjoxLzFhYTUxZDhhMWZhZmZkNWJhNjI4ODY3YjQxOWNjODE5N2I5ZGQyYzZ1OTp0aW1lc3RhbXB1MTA6MjAyMi0wOS0xN2U=",
      version: 100291,
      extra: {
        launcher: "1/51e8149f0425c2b57674b974fe7b645d146fa02f",
        player: "1/1aa51d8a1faffd5ba628867b419cc8197b9dd2c6",
        timestamp: "2022-09-17",
      },
    };
  }

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
    throw new NewProjectVersionFoundError("New player commit hash required");
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

  if (metadata.apvVersion < newApv.version) {
    console.log(
      `ApvVersion is ${newApv.version}, Player update required, Start player update`
    );

    return true;
  }

  if (existsVersion < newVersion) {
    console.log(
      `PlayersVersion is ${newVersion}, Player update required, Start player update`
    );

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
    if (!newApv.extra[project]) {
      throw new NewProjectVersionFoundError(
        `New ${project} commit hash required`
      );
    }

    const { version: oldVersion } = oldApv.extra[project]
      ? decodeProjectVersion(oldApv.extra[project])
      : { version: -1 };
    const { version: newVersion, commitHash: newCommit } = decodeProjectVersion(
      newApv.extra[project]
    );

    result[project] = {
      projectVersion: newApv.extra[project],
      url: buildDownloadUrl(
        baseUrl,
        netenv,
        newApv.version,
        project,
        newCommit,
        platform
      ),
      updateRequired:
        oldApv.version < newApv.version || oldVersion < newVersion,
    };
  });

  // Will this be right...?
  return result as {
    player: IProjectUpdate;
    launcher: IProjectUpdate;
  };
}
