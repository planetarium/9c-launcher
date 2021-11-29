import Store from "electron-store";
import path from "path";
import { IConfig } from "./interfaces/config";

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
    default: ["ec2-18-190-48-27.us-east-2.compute.amazonaws.com,80,31238"],
  },
};

let index = -1;

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

const HeadlessUrl = (): string => {
  const nodeInfo = SelectedNode();
  return nodeInfo.HeadlessUrl();
};

const SelectedNode = (): NodeInfo => {
  return NodeList()[index];
};

export class NodeInfo {
  constructor(host: string, graphqlPort: number, rpcPort: number) {
    this.host = host;
    this.graphqlPort = graphqlPort;
    this.rpcPort = rpcPort;
  }

  readonly host: string;
  readonly graphqlPort: number;
  readonly rpcPort: number;

  public GraphqlServer(): string {
    return `${this.host}/graphql`;
  }

  public HeadlessUrl(): string {
    return `${this.host}:${this.graphqlPort}`;
  }

  public RpcUrl(): string {
    return `${this.host}:${this.rpcPort}`;
  }
}

const NodeList = (): NodeInfo[] => {
  let list: NodeInfo[] = [];
  if (get("UseRemoteHeadless")) {
    const remoteNodeList: string[] = get("RemoteNodeList");
    remoteNodeList.forEach((v) => {
      const rawInfos = v.split(",");
      if (rawInfos.length != 3) {
        throw new Error(`${v} does not contained node info.`);
      }
      const host = rawInfos[0];
      const graphqlPort = Number.parseInt(rawInfos[1]);
      const rpcPort = Number.parseInt(rawInfos[2]);
      const nodeInfo = new NodeInfo(host, graphqlPort, rpcPort);
      list.push(nodeInfo);
    });
  } else {
    const nodeInfo = new NodeInfo(
      LocalServerHost().host,
      LocalServerPort().port,
      RpcServerPort().port
    );
    list.push(nodeInfo);
  }
  if (index === -1) {
    index = Math.floor(Math.random() * list.length);
  }
  return list;
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
export const HEADLESS_URL = HeadlessUrl();
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
export const REMOTE_NODE: NodeInfo = SelectedNode();
