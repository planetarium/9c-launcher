import Store from "electron-store";
import path from "path";
import { IConfig } from "./interfaces/config";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated/graphql-request";

const { app } =
  process.type === "browser" ? require("electron") : require("electron").remote;

const schema: any = {
  AppProtocolVersion: {
    type: "string",
  },
  SnapshotPaths: {
    type: "array",
    default: [],
  },
  GenesisBlockPath: {
    type: "string",
    default: "",
  },
  StoreType: {
    type: "string",
    default: "rocksdb",
  },
  NoMiner: {
    type: "boolean",
    default: true,
  },
  SnapshotThreshold: {
    type: "number",
    default: 0,
  },
  TrustedAppProtocolVersionSigners: {
    type: "array",
    default: [
      "02a5e2811a9bfa4eec274e806debd622c53702bce39a809918563a4cf34189ff85",
    ],
  },
  IceServerStrings: {
    type: "array",
    default: [
      "turn://0ed3e48007413e7c2e638f13ddd75ad272c6c507e081bd76a75e4b7adc86c9af:0apejou+ycZFfwtREeXFKdfLj2gCclKzz5ZJ49Cmy6I=@turn-us.planetarium.dev:3478",
      "turn://0ed3e48007413e7c2e638f13ddd75ad272c6c507e081bd76a75e4b7adc86c9af:0apejou+ycZFfwtREeXFKdfLj2gCclKzz5ZJ49Cmy6I=@turn-us2.planetarium.dev:3478",
      "turn://0ed3e48007413e7c2e638f13ddd75ad272c6c507e081bd76a75e4b7adc86c9af:0apejou+ycZFfwtREeXFKdfLj2gCclKzz5ZJ49Cmy6I=@turn-us3.planetarium.dev:3478",
    ],
  },
  PeerStrings: {
    type: "array",
    default: [],
  },
  BlockchainStoreDirParent: {
    type: "string",
    default: "",
  },
  BlockchainStoreDirName: {
    type: "string",
    default: "9c",
  },
  Locale: {
    type: "string",
    default: app.getLocale(),
  },
  Workers: {
    type: "integer",
    default: 20,
  },
  Confirmations: {
    type: "integer",
    default: 0,
  },
  HeadlessArgs: {
    type: "array",
    default: [],
  },
  Mixpanel: {
    type: "boolean",
    default: true,
  },
  Sentry: {
    type: "boolean",
    default: true,
  },
  MuteTeaser: {
    type: "boolean",
    default: false,
  },
  LogSizeBytes: {
    type: "integer",
    default: 1024 * 1024 * 1024 * 1,
  },
  AwsAccessKey: {
    type: "string",
    default: undefined,
  },
  AwsSecretKey: {
    type: "string",
    default: undefined,
  },
  AwsRegion: {
    type: "string",
    default: undefined,
  },
  DataProviderUrl: {
    type: "string",
    default: undefined,
  },
  Network: {
    type: "string",
    default: "9c-main",
  },
  SwapAddress: {
    type: "string",
    default: undefined,
  },
  ConfigVersion: {
    type: "integer",
    default: 0,
  },
  UseRemoteHeadless: {
    type: "boolean",
    default: true,
  },
  LaunchPlayer: {
    type: "boolean",
    default: true,
  },
  RemoteNodeList: {
    type: "array",
    default: [
      "aba105ce4868747839ab806175be8b37-13503424.us-east-2.elb.amazonaws.com,80,31238",
      "a0d01f897e0a2434798e8b4607ac32ea-994288696.us-east-2.elb.amazonaws.com,80,31238",
      "aaa453a1c166c4d7eb6dad7151ca373b-1343028350.us-east-2.elb.amazonaws.com,80,31238",
      "a5e8503f9fd024ca292f193c86de744a-754114509.us-east-2.elb.amazonaws.com,80,31238",
      "a00d334f09e1c42feb4c38f8c3010543-423825111.us-east-2.elb.amazonaws.com,80,31238",
      "aa7d058e4606a4cc7b2bc7c6c915670b-1136359886.us-east-2.elb.amazonaws.com,80,31238",
      "afff4ede31cef4543a2706d8b1f594e2-1812701003.us-east-2.elb.amazonaws.com,80,31238",
      "af1da83a0dbf14b1d976308c7b3efb5d-689966316.us-east-2.elb.amazonaws.com,80,31238",
      "a2bb53cb50b1f4e698396bdc9f93320e-1430351524.us-east-2.elb.amazonaws.com,80,31238",
      "a86a3b8c3140943ec9abe0115e8ab0b6-1765153438.us-east-2.elb.amazonaws.com,80,31238",
      "adb1932b4da92426abd7116c65875faa-1809698636.us-east-2.elb.amazonaws.com,80,31238",
      "ad6b3a37d7d09408593d012193bdea55-1167581570.us-east-2.elb.amazonaws.com,80,31238",
      "ac38a8718f27544c088bb73086ff305c-1852178024.us-east-2.elb.amazonaws.com,80,31238",
      "aa26cee904d0540c9ab30deb71260de6-963671627.us-east-2.elb.amazonaws.com,80,31238",
      "a68fae48aeecd4661bc653eb8bfb5815-777682477.us-east-2.elb.amazonaws.com,80,31238",
      "a9a7fa4e68584472eadaa859c1ccfa96-307491802.us-east-2.elb.amazonaws.com,80,31238",
      "a2e01f4a7f4ce47efa3097d52fdf56f8-108664089.us-east-2.elb.amazonaws.com,80,31238",
      "a6b8aa8271d6946ea998b110863cbfb9-1918498264.us-east-2.elb.amazonaws.com,80,31238",
      "ae4fa84e10d214209ad600a77371223a-1562070758.us-east-2.elb.amazonaws.com,80,31238",
      "af7640523846d4152b45b33076a5629d-1374793070.us-east-2.elb.amazonaws.com,80,31238",
    ],
  },
  UseV2Interface: {
    type: "boolean",
    default: false,
  },
};

export const configStore = new Store<IConfig>({
  cwd: app.getAppPath(),
  schema,
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

  // FIXME: 열려 있지 않는 랜덤한 포트를 반환하게 해야 합니다.
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

  // FIXME: 열려 있지 않는 랜덤한 포트를 반환하게 해야 합니다.
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
  defaultValue?: IConfig[K]
): IConfig[K] {
  if (userConfigStore.has(key)) {
    return userConfigStore.get(key);
  }

  return configStore.get(key, defaultValue);
}

export function getBlockChainStorePath(): string {
  return path.join(blockchainStoreDirParent, get("BlockchainStoreDirName"));
}

export const REQUIRED_DISK_SPACE = 20n * 1000n * 1000n * 1000n;
export const SNAPSHOT_SAVE_PATH = app.getPath("userData");
export const MAC_GAME_PATH = "9c.app/Contents/MacOS/9c";
export const WIN_GAME_PATH = "9c.exe";
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
