import Store from "electron-store";
import path from "path";
import { IConfig } from "./interfaces/config";

const { app } =
  process.type === "browser" ? require("electron") : require("electron").remote;

const schema: any = {
  AppProtocolVersion: {
    type: "string",
    default:
      "2001/019101FEec7ed4f918D396827E1277DEda1e20D4/MEQCIBlLqJk+INI.EHa2EvdUl.7LIZoOXRm3+9GF0fQPakw8AiBE2wbRGSnohWgDHm1gSU+iSpVv7sxKQFHcrfKFTD72dg==/ZHUxNjpXaW5kb3dzQmluYXJ5VXJsdTU0Omh0dHBzOi8vZG93bmxvYWQubmluZS1jaHJvbmljbGVzLmNvbS92MjAwMS9XaW5kb3dzLnppcHUxNDptYWNPU0JpbmFyeVVybHU1NTpodHRwczovL2Rvd25sb2FkLm5pbmUtY2hyb25pY2xlcy5jb20vdjIwMDEvbWFjT1MudGFyLmd6dTk6dGltZXN0YW1wdTIwOjIwMjAtMDYtMzBUMDU6NDg6MTFaZQ==",
  },
  SnapshotPaths: {
    type: "array",
    default: [],
  },
  GenesisBlockPath: {
    type: "string",
    default: "",
  },
  MinimumDifficulty: {
    type: "integer",
    default: 5000000,
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
    default: undefined
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
    default: 0
  },
  RemoteRpcServerHost: {
    type: "string",
    default: "a52f4c47593a3469d8e2e82f519da413-618807742.us-east-2.elb.amazonaws.com"
  },
  RemoteRpcServerPort: {
    type: "integer",
    default: 31238
  },
  RemoteGraphQLServerHost: {
    type: "string",
    default: "a52f4c47593a3469d8e2e82f519da413-618807742.us-east-2.elb.amazonaws.com"
  },
  RemoteGraphQLServerPort: {
    type: "integer",
    default: 80
  },
  UseRemoteHeadless : {
    type: "boolean",
    default: false
  }
}

export const configStore = new Store<IConfig>({
  cwd: app.getAppPath(),
  schema
});
export const userConfigStore = new Store<IConfig>();

const LocalServerUrl = (): string => {
  return `${LocalServerHost().host}:${LocalServerPort().port}`;
};

const GraphQLServer = (): string => {
  return `${LocalServerUrl}/graphql`;
};

const RemoteGraphQLServer = (): string => {
  return `${RemoteHeadlessUrl}/graphql`;
}

const RemoteHeadlessUrl = (): string => {
  return `${get("RemoteGraphQLServerHost")}:${get("RemoteGraphQLServerPort")}`;
}

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

export function get<K extends keyof IConfig>(key: K, defaultValue?: IConfig[K]): IConfig[K] {
  if (userConfigStore.has(key)) {
    return userConfigStore.get(key);
  }

  return configStore.get(key, defaultValue);
}

export function getBlockChainStorePath(): string {
  return path.join(
    blockchainStoreDirParent,
    get("BlockchainStoreDirName")
  )
}

export const REQUIRED_DISK_SPACE = 2 * 1000 * 1000 * 1000;
export const SNAPSHOT_SAVE_PATH = app.getPath("userData");
export const MAC_GAME_PATH = "9c.app/Contents/MacOS/9c";
export const WIN_GAME_PATH = "9c.exe";
export const LOCAL_SERVER_URL = LocalServerUrl();
export const GRAPHQL_SERVER_URL = GraphQLServer();
export const REMOTE_HEADLESS_URL = RemoteHeadlessUrl();
export const REMOTE_GRAPHQL_SERVER_URL = RemoteGraphQLServer();
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
