import Store from "electron-store";
import path from "path";
import { IConfig } from "./interfaces/config";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated/graphql-request";

export const { app } =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  process.type === "browser"
    ? require("electron")
    : require("@electron/remote");

if (process.type === "browser") Store.initRenderer();

export const configStore = new Store<IConfig>({
  cwd: app.getAppPath(),
});

const network = configStore.get("Network");
export const userConfigStore = new Store<IConfig>({
  name: network === "9c-main" ? "config" : `config.${network}`,
});

const LocalServerUrl = (): string => {
  return `${LocalServerHost().host}:${LocalServerPort().port}`;
};

const GraphQLServer = (): string => {
  return `${LocalServerUrl}/graphql`;
};

export class NodeInfo {
  constructor(
    host: string,
    graphqlPort: number,
    rpcPort: number,
    nodeNumber: number
  ) {
    this.host = host;
    this.graphqlPort = graphqlPort;
    this.rpcPort = rpcPort;
    this.nodeNumber = nodeNumber;
  }

  readonly host: string;
  readonly graphqlPort: number;
  readonly rpcPort: number;
  readonly nodeNumber: number;
  clientCount: number = 0;

  public GraphqlServer(): string {
    return `${this.HeadlessUrl()}/graphql`;
  }

  public HeadlessUrl(): string {
    return `${this.host}:${this.graphqlPort}`;
  }

  public RpcUrl(): string {
    return `${this.host}:${this.rpcPort}`;
  }

  public async PreloadEnded(): Promise<boolean> {
    const client = new GraphQLClient(`http://${this.GraphqlServer()}`);
    const headlessGraphQLSDK = getSdk(client);
    try {
      const ended = await headlessGraphQLSDK.PreloadEnded();
      if (ended.status == 200) {
        this.clientCount = ended.data!.rpcInformation.totalCount;
        return ended.data!.nodeStatus.preloadEnded;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}

const NodeList = async (): Promise<NodeInfo[]> => {
  const nodeList: NodeInfo[] = [];
  if (get("UseRemoteHeadless")) {
    const remoteNodeList: string[] = get("RemoteNodeList");
    await Promise.any(
      remoteNodeList
        .sort(() => Math.random() - 0.5)
        .map(async (v, index) => {
          const rawInfos = v.split(",");
          if (rawInfos.length != 3) {
            console.error(`${v} does not contained node info.`);
            return;
          }
          const host = rawInfos[0];
          const graphqlPort = Number.parseInt(rawInfos[1]);
          const rpcPort = Number.parseInt(rawInfos[2]);
          const nodeInfo = new NodeInfo(host, graphqlPort, rpcPort, index + 1);
          try {
            const preloadEnded = await nodeInfo.PreloadEnded();
            if (preloadEnded) nodeList.push(nodeInfo);
          } catch (e) {
            console.error(e);
          }
        })
    );
  } else {
    const nodeInfo = new NodeInfo(
      LocalServerHost().host,
      LocalServerPort().port,
      RpcServerPort().port,
      1
    );
    nodeList.push(nodeInfo);
  }
  return nodeList;
};

const RpcServerHost = (): { host: string; notDefault: boolean } => {
  const host = process.env.NC_RPC_SERVER_HOST;
  return host == null
    ? { host: "127.0.0.1", notDefault: false }
    : { host, notDefault: true };
};

const RpcServerPort = (): { port: number; notDefault: boolean } => {
  const port = process.env.NC_RPC_SERVER_PORT;
  if (port != null && port.match(/^\d+$/)) {
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
  if (port != null && port.match(/^\d+$/)) {
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
  defaultValue?: Required<IConfig>[K]
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
export const MAC_GAME_PATH = path.join(app.getPath("userData"), "player/9c");
export const WIN_GAME_PATH = path.join(
  app.getPath("userData"),
  "player/9c.exe"
);
export const LINUX_GAME_PATH = path.join(app.getPath("userData"), "player/9c");
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
export const MIXPANEL_TOKEN = "80a1e14b57d050536185c7459d45195a";
export const TRANSIFEX_TOKEN = "1/9ac6d0a1efcda679e72e470221e71f4b0497f7ab";
export const DOWNLOAD_URI = "download.nine-chronicles.com";

export async function initializeNode(): Promise<NodeInfo> {
  console.log("config initialize called");
  const nodeList = await NodeList();
  if (nodeList.length < 1) {
    throw Error("can't find available remote node.");
  }
  nodeList.sort((a, b) => {
    return a.clientCount - b.clientCount;
  });
  console.log("config initialize complete");
  const nodeInfo = nodeList[0];
  console.log(
    `selected node: ${nodeInfo.HeadlessUrl()}, clients: ${nodeInfo.clientCount}`
  );
  return nodeInfo;
}
