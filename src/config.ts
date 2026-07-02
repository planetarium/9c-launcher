import Store from "electron-store";
import { GraphQLClient } from "graphql-request";
import path from "path";
import { getSdk } from "./generated/graphql-request";
import { IConfig } from "./interfaces/config";
import { RpcEndpoints } from "./interfaces/registry";
import {
  rttClientWeightedSelector,
  waitFirstThenGrace,
} from "./utils/nodeSelector";

export const { app } =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  process.type === "browser"
    ? require("electron")
    : require("@electron/remote");

if (process.type === "browser") Store.initRenderer();

export function getConfigPath() {
  return app.getPath("userData");
}
export const configFileName = "config.json";
export const CONFIG_FILE_PATH = path.join(getConfigPath(), configFileName);

export const configStore = new Store<IConfig>({
  cwd: getConfigPath(),
});

const network = configStore.get(
  "Network",
  process.env.DEFAULT_NETWORK || "main",
);

// Removed 9c prefix
export const netenv = network === "9c-main" ? "main" : network;
export const userConfigStore = new Store<IConfig>({
  name: network === "9c-main" ? "config" : `config.${network}`,
});

export const playerPath = path.join(
  app.getPath("userData"),
  `player/${netenv}`,
);

const LocalServerUrl = (): string => {
  return `${LocalServerHost().host}:${LocalServerPort().port}`;
};

const GraphQLServer = (): string => {
  return `${LocalServerUrl}/graphql`;
};

export class NodeInfo {
  constructor(gqlUrl: string, grpcUrl: string) {
    this.gqlUrl = gqlUrl;
    this.grpcUrl = grpcUrl;
  }

  readonly gqlUrl: string;
  readonly grpcUrl: string; //TODO Validate URL Validity
  apv = 0;
  clientCount = 0;
  tip = 0;
  rttMs = Infinity;

  public GraphqlClient(): GraphQLClient {
    return new GraphQLClient(this.gqlUrl);
  }

  public async PreloadEnded(): Promise<boolean> {
    const headlessGraphQLSDK = getSdk(this.GraphqlClient());
    const started = performance.now();
    try {
      const ended = await Promise.race([
        headlessGraphQLSDK.PreloadEnded(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("PreloadEnded timeout")), 5000),
        ),
      ]);
      if (ended.status === 200) {
        this.clientCount = ended.data!.rpcInformation.totalCount;
        this.tip = ended.data!.nodeStatus.tip.index;
        this.apv = ended.data!.nodeStatus.appProtocolVersion?.version ?? 0;
        // 파싱이 끝난 뒤 대입 — 중간에 throw하면 rttMs는 Infinity로 남는다
        this.rttMs = performance.now() - started;
        return ended.data!.nodeStatus.preloadEnded;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}

// TODO : Connect To config RPC Endpoints if Registry not works
const parseConfigRpcEndpoints = (): RpcEndpoints => {
  const result: RpcEndpoints = {
    "headless.gql": [],
    "headless.grpc": [],
  };
  const remoteNodeList = get("RemoteNodeList");
  remoteNodeList.forEach((v) => {
    const rawInfos = v.split(",");
    if (rawInfos.length !== 3) {
      console.error(`${v} does not contain node info.`);
      return;
    }
    const host = rawInfos[0];
    const graphqlPort = Number.parseInt(rawInfos[1]);
    const rpcPort = Number.parseInt(rawInfos[2]);

    if (isNaN(graphqlPort) || isNaN(rpcPort)) {
      console.error(`Invalid port values in ${v}.`);
      return;
    }

    const gqlProtocol =
      graphqlPort === 80 || graphqlPort === 443 ? "https://" : "http://";
    const gqlUrl = `${gqlProtocol}${host}:${graphqlPort}/graphql`;
    const grpcUrl = `${host}:${rpcPort}`;

    result["headless.gql"].push(gqlUrl);
    result["headless.grpc"].push(grpcUrl);
  });
  return result;
};

const NodeList = async (
  rpcEndpoints: RpcEndpoints,
  quick: boolean,
): Promise<NodeInfo[]> => {
  const nodeList: NodeInfo[] = [];

  //Pre-connection mixer
  if (
    rpcEndpoints["headless.gql"].length !== rpcEndpoints["headless.grpc"].length
  )
    throw new Error("Arrays must have the same length."); // ...should be fixed for non-same length.

  const indices = Array.from(
    { length: rpcEndpoints["headless.gql"].length },
    (_, i) => i,
  ).sort(() => Math.random() - 0.5);
  const endpoints = indices.map((i) => {
    return {
      gqlUrl: rpcEndpoints["headless.gql"][i],
      grpcUrl: rpcEndpoints["headless.grpc"][i],
    };
  });

  //Test connection
  const connectionCheck = endpoints.map(async (v) => {
    const nodeInfo = new NodeInfo(v.gqlUrl, v.grpcUrl);
    try {
      const preloadEnded = await nodeInfo.PreloadEnded();
      if (preloadEnded) nodeList.push(nodeInfo);
    } catch (e) {
      console.error(e);
    }
  });

  if (quick) {
    await waitFirstThenGrace(connectionCheck);
    return [...nodeList];
  }

  await Promise.all(connectionCheck);
  return [...nodeList];
};

const NonStaleNodeList = (
  nodeList: NodeInfo[],
  staleThreshold: number,
): NodeInfo[] => {
  // tip이 0(genesis/미싱크) 이하인 노드는 죽은 것으로 간주하고 후보에서 제외한다.
  // 이렇게 하지 않으면 응답 노드가 전부 tip=0일 때 maxTip=0이 되어
  // 상대 임계치(maxTip - staleThreshold)가 음수가 되고 죽은 노드가 통과한다.
  const liveNodes = nodeList.filter((node) => node.tip > 0);
  if (staleThreshold < 0 || liveNodes.length === 0) {
    return liveNodes;
  }
  const maxTip = Math.max(...liveNodes.map((node) => node.tip));
  return liveNodes.filter((node) => node.tip >= maxTip - staleThreshold);
};

const RpcServerHost = (): { host: string; notDefault: boolean } => {
  const host = process.env.NC_RPC_SERVER_HOST;
  return host == null
    ? { host: "127.0.0.1", notDefault: false }
    : { host, notDefault: true };
};

const RpcServerPort = (): { port: number; notDefault: boolean } => {
  const port = process.env.NC_RPC_SERVER_PORT;
  if (port?.match(/^\d+$/)) {
    return { port: +port, notDefault: true };
  }

  // FIXME: It should return a random unopened port.
  return { port: 23142, notDefault: false };
};

const LocalServerHost = (): { host: string; notDefault: boolean } => {
  const host = process.env.NC_GRAPHQL_SERVER_HOST;
  return host == null
    ? { host: "localhost", notDefault: false }
    : { host, notDefault: true };
};

const LocalServerPort = (): { port: number; notDefault: boolean } => {
  const port = process.env.NC_GRAPHQL_SERVER_PORT;
  if (port?.match(/^\d+$/)) {
    return { port: +port, notDefault: true };
  }

  // FIXME: It should return not opened 'random' port.
  return { port: 23061, notDefault: false };
};

const getLocalApplicationDataPath = (): string => {
  if (process.platform === "darwin") {
    return path.join(app.getPath("home"), ".local", "share");
  }
  return path.join(app.getPath("home"), "AppData", "Local");
};

export const blockchainStoreDirParent =
  get("BlockchainStoreDirParent") === ""
    ? path.join(getLocalApplicationDataPath(), "planetarium")
    : get("BlockchainStoreDirParent");

export function get<K extends keyof IConfig>(
  key: K,
  defaultValue?: Required<IConfig>[K],
): IConfig[K] {
  if (userConfigStore.has(key)) {
    return userConfigStore.get(key);
  }

  // @ts-expect-error - The overload doesn't work well with optional arguments.
  return configStore.get(key, defaultValue);
}

export function getBlockChainStorePath(): string {
  return path.join(blockchainStoreDirParent, get("BlockchainStoreDirName"));
}

export const REQUIRED_DISK_SPACE = 20n * 1000n * 1000n * 1000n;
export const SNAPSHOT_SAVE_PATH = app.getPath("userData");
export const LEGACY_MAC_GAME_PATH = path.join(
  playerPath,
  "9c.app/Contents/MacOS/9c",
);
export const LEGACY_WIN_GAME_PATH = path.join(playerPath, "9c.exe");
export const LEGACY_LINUX_GAME_PATH = path.join(playerPath, "9c");
export const MAC_GAME_PATH = path.join(
  playerPath,
  "NineChronicles.app/Contents/MacOS/NineChronicles",
);
export const WIN_GAME_PATH = path.join(playerPath, "NineChronicles.exe");
export const LINUX_GAME_PATH = path.join(playerPath, "NineChronicles");
export const LOCAL_SERVER_URL = LocalServerUrl();
export const GRAPHQL_SERVER_URL = GraphQLServer();
export const LOCAL_SERVER_HOST: string = LocalServerHost().host;
export const LOCAL_SERVER_PORT: number = LocalServerPort().port;
export const RPC_SERVER_HOST: string = RpcServerHost().host;
export const RPC_SERVER_PORT: number = RpcServerPort().port;
export const CUSTOM_SERVER: boolean =
  LocalServerHost().notDefault ||
  LocalServerPort().notDefault ||
  RpcServerHost().notDefault ||
  RpcServerPort().notDefault;
export const TRANSIFEX_TOKEN = "1/9ac6d0a1efcda679e72e470221e71f4b0497f7ab";
export const DEFAULT_DOWNLOAD_BASE_URL = "https://release.nine-chronicles.com";
export const installerName = "NineChroniclesInstaller.exe";

export const EXECUTE_PATH: {
  [k in NodeJS.Platform]: string | null;
} = {
  aix: null,
  android: null,
  darwin: MAC_GAME_PATH,
  freebsd: null,
  haiku: null,
  linux: LINUX_GAME_PATH,
  openbsd: null,
  sunos: null,
  win32: WIN_GAME_PATH,
  cygwin: WIN_GAME_PATH,
  netbsd: null,
};
export const LEGACY_EXECUTE_PATH: {
  [k in NodeJS.Platform]: string | null;
} = {
  aix: null,
  android: null,
  darwin: LEGACY_MAC_GAME_PATH,
  freebsd: null,
  haiku: null,
  linux: LEGACY_LINUX_GAME_PATH,
  openbsd: null,
  sunos: null,
  win32: LEGACY_WIN_GAME_PATH,
  cygwin: LEGACY_WIN_GAME_PATH,
  netbsd: null,
};
export const baseUrl = get("DownloadBaseURL", DEFAULT_DOWNLOAD_BASE_URL);
export const installerUrl = path.join(DEFAULT_DOWNLOAD_BASE_URL, installerName);

export async function initializeNode(
  rpcEndpoints: RpcEndpoints,
  quick: boolean = false,
): Promise<NodeInfo> {
  console.log("node selector called");
  const relativeTipLimit = get("RemoteClientStaleTipLimit", 20) ?? Infinity;
  const nodeList = NonStaleNodeList(
    await NodeList(rpcEndpoints, quick),
    relativeTipLimit,
  );
  if (nodeList.length < 1) {
    throw Error("can't find available remote node.");
  }
  const nodeInfo = rttClientWeightedSelector(nodeList);
  console.log(
    `selected node: ${nodeInfo.gqlUrl}, clients: ${
      nodeInfo.clientCount
    }, rtt: ${nodeInfo.rttMs.toFixed(0)}ms`,
  );
  return nodeInfo;
}

export async function initializeNodeWithRetry(
  rpcEndpoints: RpcEndpoints,
  quick: boolean = false,
  maxRetries: number = 2,
  baseDelayMs: number = 1000,
): Promise<NodeInfo> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await initializeNode(rpcEndpoints, quick);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.warn(
        `initializeNode attempt ${attempt + 1}/${maxRetries + 1} failed: ${
          lastError.message
        }`,
      );
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError!;
}
