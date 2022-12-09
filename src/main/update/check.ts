import { IApv, ISimpleApv } from "src/interfaces/apv";
import {
  AppProtocolVersionType,
  getSdk,
} from "../../generated/graphql-request";
import { buildDownloadUrl } from "../../utils/url";
import { get as getConfig, baseUrl, netenv, playerPath } from "../../config";
import { readVersion, exists as metafileExists } from "./metafile";
import { analyzeApv, verifyApv, decodeProjectVersion } from "../../utils/apv";
import { retryWrapper } from "../../utils/graphql";
import { GraphQLClient } from "graphql-request";

export class QueryApvFailedError extends Error {}
export class GetnodeApvFailedError extends Error {}
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

const localApvToken = getConfig("AppProtocolVersion");
const trustedApvSigners = getConfig("TrustedAppProtocolVersionSigners");

export async function checkForUpdate(
  graphqlClient: GraphQLClient,
  platform: NodeJS.Platform
): Promise<IUpdate> {
  let nodeApv;
  try {
    nodeApv = await getNodeApv(graphqlClient, trustedApvSigners);
  } catch (e) {
    console.error(`getNodeApv Error ocurred ${e}:\n`, e.stderr);
    throw e;
  }

  return await checkForUpdateFromApv(nodeApv, platform);
}

export async function checkForUpdateFromApv(
  nodeApv: ISimpleApv,
  platform: NodeJS.Platform
): Promise<IUpdate> {
  const localApv = analyzeApv(localApvToken);

  const info = analyzeApvExtra(nodeApv, localApv, platform);

  if (!info.projects.player.updateRequired) {
    console.log(`Not required player update, Check player path.`);

    info.projects.player.updateRequired = await checkMetafile(
      nodeApv,
      playerPath
    );
  }

  return {
    newApv: nodeApv,
    oldApv: localApv,
    ...info,
  };
}

/**
 * Checks `CompatiblityVersion` to check if we can proceed with our updater.
 */
export function checkCompatiblity(
  nodeApv: ISimpleApv,
  localApv: ISimpleApv
): boolean {
  const peersCompatVersion = BigInt(
    (nodeApv.extra["CompatiblityVersion"] as string | number) ?? 0
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

async function getNodeApv(
  graphqlClient: GraphQLClient,
  trustedApvSigners: string[]
): Promise<IApv> {
  const query = await getSdk(
    graphqlClient,
    retryWrapper
  ).NodeAppProtocolVersion();
  if (query.status == 200) {
    const nodeApvToken: AppProtocolVersionType =
      query.data.nodeStatus.appProtocolVersion!;
    if (verifyApv(trustedApvSigners, nodeApvToken)) {
      return analyzeApv(nodeApvToken);
    } else {
      throw new GetnodeApvFailedError(
        `Ignore APV[${nodeApvToken}] due to failure to validating.`
      );
    }
  } else {
    throw new QueryApvFailedError(
      `Failed to query nodeApvToken from GraphQL node, Node: ${graphqlClient}`
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
      ? decodeProjectVersion(oldApv.extra[project]!)
      : { version: -1 };
    const { version: newVersion, commitHash: newCommit } = decodeProjectVersion(
      newApv.extra[project]!
    );

    projects[project] = {
      projectVersion: newApv.extra[project]!,
      url: buildDownloadUrl(
        baseUrl,
        netenv,
        newApv,
        project,
        newCommit,
        platform
      ),
      updateRequired:
        oldApv.version < newApv.version || oldVersion < newVersion,
    };
  });

  return { projects } as {
    projects: Required<Record<Project, IProjectUpdate>>;
  };
}
