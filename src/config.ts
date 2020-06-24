import Store from "electron-store";
import path from "path";
import { app, remote } from "electron";

function getUserDataPath(): string {
  let getPath;
  if (process.type === "browser") {
    getPath = app.getPath("userData");
  } else {
    getPath = remote.app.getPath("userData");
  }

  return getPath;
}

export const electronStore = new Store({
  schema: {
    SNAPSHOT_DOWNLOAD_PATH: {
      type: "string",
      format: "uri",
      default:
        "https://9c-test.s3.ap-northeast-2.amazonaws.com/snapshots/2be5da279272a3cc2ecbe329405a613c40316173773d6d2d516155d2aa67d9bb-snapshot-202000525.zip",
    },
    AppProtocolVersion: {
      type: "string",
      default:
        "22/019101FEec7ed4f918D396827E1277DEda1e20D4/MEUCIQDiV8dGOGQkujYQGic8Un44ZcU0wkxVpphnl6VQrIRRcwIgM75NixNvPnrUXFM5YW+uaRqdBhS2JNpTEgd5bDT.Lpw=/ZHUxNjpXaW5kb3dzQmluYXJ5VXJsdTUyOmh0dHBzOi8vZG93bmxvYWQubmluZS1jaHJvbmljbGVzLmNvbS92MjIvV2luZG93cy56aXB1MTQ6bWFjT1NCaW5hcnlVcmx1NTM6aHR0cHM6Ly9kb3dubG9hZC5uaW5lLWNocm9uaWNsZXMuY29tL3YyMi9tYWNPUy50YXIuZ3p1OTp0aW1lc3RhbXB1MjA6MjAyMC0wNS0xMVQwNTozMDowMFpl",
    },
    GenesisBlockPath: {
      type: "string",
      default:
        "https://9c-test.s3.amazonaws.com/genesis-block-ea67452fdbf8234308015d3ecd5b1235b0dea844",
    },
    RpcServer: {
      type: "boolean",
      default: true,
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
  },
  watch: true,
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

const SwarmServerPort = (): number => {
  // FIXME: 열려 있지 않는 랜덤한 포트를 반환하게 해야 합니다.
  return 27923;
};

export const SNAPSHOT_SAVE_PATH = getUserDataPath();
export const MAC_GAME_PATH = "9c.app/Contents/MacOS/9c";
export const WIN_GAME_PATH = "9c.exe";
export const RPC_LOOPBACK_HOST = "127.0.0.1";
export const LOCAL_SERVER_URL = LocalServerUrl();
export const GRAPHQL_SERVER_URL = GraphQLServer();
export const LOCAL_SERVER_PORT = LocalServerPort();
export const BLOCKCHAIN_STORE_PATH = path.join(getUserDataPath(), ".store");
export const standaloneProperties: StandaloneProperties = {
  AppProtocolVersion: electronStore.get("AppProtocolVersion") as string,
  GenesisBlockPath: electronStore.get("GenesisBlockPath") as string,
  RpcServer: true,
  RpcListenHost: "0.0.0.0",
  RpcListenPort: RpcServerPort(),
  MinimumDifficulty: electronStore.get("MinimumDifficulty") as number,
  SwarmHost: "0.0.0.0",
  SwarmPort: SwarmServerPort(),
  StoreType: electronStore.get("StoreType") as string,
  StorePath: BLOCKCHAIN_STORE_PATH,
  NoMiner: electronStore.get("NoMiner") as boolean,
  TrustedAppProtocolVersionSigners: electronStore.get(
    "TrustedAppProtocolVersionSigners"
  ) as Array<string>,
  IceServerStrings: electronStore.get("IceServerStrings") as Array<string>,
  PeerStrings: electronStore.get("PeerStrings") as Array<string>,
};
