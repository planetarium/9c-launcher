import Store from "electron-store";
import path from "path";

const { app } =
  process.type === "browser" ? require("electron") : require("electron").remote;

interface IElectronStore {
  SNAPSHOT_DOWNLOAD_PATH: string;
  AppProtocolVersion: string;
  GenesisBlockPath: string;
  MinimumDifficulty: number;
  StoreType: string;
  NoMiner: boolean;
  TrustedAppProtocolVersionSigners: string[];
  IceServerStrings: string[];
  PeerStrings: string[];
  NoTrustedStateValidators: boolean;
}

export const electronStore = new Store<IElectronStore>({
  cwd: app.getAppPath(),
  schema: {
    SNAPSHOT_DOWNLOAD_PATH: {
      type: "string",
      format: "uri",
      default:
        "https://download.nine-chronicles.com/latest/4a321a45b07750ca7fa88a0a4a0c817fa26c5f5e54ac2ab91675256e6abed21a-snapshot.zip",
    },
    AppProtocolVersion: {
      type: "string",
      default:
        "2001/019101FEec7ed4f918D396827E1277DEda1e20D4/MEQCIBlLqJk+INI.EHa2EvdUl.7LIZoOXRm3+9GF0fQPakw8AiBE2wbRGSnohWgDHm1gSU+iSpVv7sxKQFHcrfKFTD72dg==/ZHUxNjpXaW5kb3dzQmluYXJ5VXJsdTU0Omh0dHBzOi8vZG93bmxvYWQubmluZS1jaHJvbmljbGVzLmNvbS92MjAwMS9XaW5kb3dzLnppcHUxNDptYWNPU0JpbmFyeVVybHU1NTpodHRwczovL2Rvd25sb2FkLm5pbmUtY2hyb25pY2xlcy5jb20vdjIwMDEvbWFjT1MudGFyLmd6dTk6dGltZXN0YW1wdTIwOjIwMjAtMDYtMzBUMDU6NDg6MTFaZQ==",
    },
    GenesisBlockPath: {
      type: "string",
      default:
        "https://9c-test.s3.ap-northeast-2.amazonaws.com/genesis-block-9c-beta-3",
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
      default: [
        "027bd36895d68681290e570692ad3736750ceaab37be402442ffb203967f98f7b6,9c-beta-seed-1.planetarium.dev,31234",
        "02f164e3139e53eef2c17e52d99d343b8cbdb09eeed88af46c352b1c8be6329d71,9c-beta-seed-2.planetarium.dev,31234",
        "0247e289aa332260b99dfd50e578f779df9e6702d67e50848bb68f3e0737d9b9a5,9c-beta-seed-3.planetarium.dev,31234",
      ],
    },
    NoTrustedStateValidators: {
      type: "boolean",
      default: false,
    },
  },
});

const LocalServerUrl = (): string => {
  return `localhost:${LocalServerPort()}`;
};

const GraphQLServer = (): string => {
  return `${LocalServerUrl}/graphql`;
};

const RpcServerPort = (): number => {
  // FIXME: 열려 있지 않는 랜덤한 포트를 반환하게 해야 합니다.
  return 23142;
};

const LocalServerPort = (): number => {
  // FIXME: 열려 있지 않는 랜덤한 포트를 반환하게 해야 합니다.
  return 23061;
};

const getLocalApplicationDataPath = (): string => {
  if (process.platform === "darwin") {
    return path.join(app.getPath("home"), ".local", "share");
  } else {
    return path.join(app.getPath("home"), "AppData", "Local");
  }
};

export const SNAPSHOT_SAVE_PATH = app.getPath("userData");
export const MAC_GAME_PATH = "9c.app/Contents/MacOS/9c";
export const WIN_GAME_PATH = "9c.exe";
export const RPC_LOOPBACK_HOST = "127.0.0.1";
export const LOCAL_SERVER_URL = LocalServerUrl();
export const GRAPHQL_SERVER_URL = GraphQLServer();
export const LOCAL_SERVER_PORT = LocalServerPort();
export const RPC_SERVER_PORT = RpcServerPort();
export const BLOCKCHAIN_STORE_PATH = path.join(
  getLocalApplicationDataPath(),
  "planetarium",
  "9c"
);
