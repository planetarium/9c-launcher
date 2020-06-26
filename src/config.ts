import Store from "electron-store";
import path from "path";

const { app } =
  process.type === "browser" ? require("electron") : require("electron").remote;

export const electronStore = new Store({
  cwd: app.getAppPath(),
  schema: {
    SNAPSHOT_DOWNLOAD_PATH: {
      type: "string",
      format: "uri",
      default:
        "https://9c-test.s3.ap-northeast-2.amazonaws.com/latest/302d8ede310cef94ab7050577f513beed048193cb92006267cf1421166f335a3-snapshot.zip",
    },
    AppProtocolVersion: {
      type: "string",
      default:
        "1027/019101FEec7ed4f918D396827E1277DEda1e20D4/MEUCIQDb9N6khWlHg0mMiQWSAWitj8BqPciTxJqZkot6WxqJZgIgC.jokMDXPaOsU+kFoEJjqIJt4NcwbKiduJFgmDcQFtY=/ZHUxNjpXaW5kb3dzQmluYXJ5VXJsdTU0Omh0dHBzOi8vZG93bmxvYWQubmluZS1jaHJvbmljbGVzLmNvbS92MTAyNy9XaW5kb3dzLnppcHUxNDptYWNPU0JpbmFyeVVybHU1NTpodHRwczovL2Rvd25sb2FkLm5pbmUtY2hyb25pY2xlcy5jb20vdjEwMjcvbWFjT1MudGFyLmd6dTk6dGltZXN0YW1wdTIwOjIwMjAtMDYtMjNUMDE6NDM6MDNaZQ==",
    },
    GenesisBlockPath: {
      type: "string",
      default:
        "https://9c-test.s3.ap-northeast-2.amazonaws.com/genesis-block-launcher-v2-test",
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
        "027bd36895d68681290e570692ad3736750ceaab37be402442ffb203967f98f7b6,a532d3e7cafcf4130931550062f4779d-693426789.ap-northeast-2.elb.amazonaws.com,31234",
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

export const SNAPSHOT_SAVE_PATH = app.getPath("userData");
export const MAC_GAME_PATH = "9c.app/Contents/MacOS/9c";
export const WIN_GAME_PATH = "9c.exe";
export const RPC_LOOPBACK_HOST = "127.0.0.1";
export const LOCAL_SERVER_URL = LocalServerUrl();
export const GRAPHQL_SERVER_URL = GraphQLServer();
export const LOCAL_SERVER_PORT = LocalServerPort();
export const BLOCKCHAIN_STORE_PATH = path.join(
  app.getPath("userData"),
  ".store"
);
export const standaloneProperties: StandaloneProperties = {
  AppProtocolVersion: electronStore.get("AppProtocolVersion") as string,
  GenesisBlockPath: electronStore.get("GenesisBlockPath") as string,
  RpcServer: true,
  RpcListenHost: "0.0.0.0",
  RpcListenPort: RpcServerPort(),
  MinimumDifficulty: electronStore.get("MinimumDifficulty") as number,
  StoreType: electronStore.get("StoreType") as string,
  StorePath: BLOCKCHAIN_STORE_PATH,
  NoMiner: electronStore.get("NoMiner") as boolean,
  TrustedAppProtocolVersionSigners: electronStore.get(
    "TrustedAppProtocolVersionSigners"
  ) as Array<string>,
  IceServerStrings: electronStore.get("IceServerStrings") as Array<string>,
  PeerStrings: electronStore.get("PeerStrings") as Array<string>,
};
