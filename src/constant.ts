export const DEV_SERVER_URL = "http://localhost:9000";
export const GRAPHQL_SERVER_URL = "http://localhost"
export const GRAPHQL_ENTRYPOINT = `${GRAPHQL_SERVER_URL}/graphql`
export const HTML_FILE_PATH = "index.html";
export const SNAPSHOT_DOWNLOAD_PATH = "https://9c-test.s3.ap-northeast-2.amazonaws.com/snapshots/2be5da279272a3cc2ecbe329405a613c40316173773d6d2d516155d2aa67d9bb-snapshot-202000525.zip";
export const SNAPSHOT_SAVE_PATH = undefined;
export const MAC_GAME_PATH = "9c.app/Contents/MacOS/9c";
export const WIN_GAME_PATH = "9c.exe";
export const RPC_LOOPBACK_HOST = "127.0.0.1";

export const standaloneProperties: StandaloneProperties = {
    AppProtocolVersion: "22/019101FEec7ed4f918D396827E1277DEda1e20D4/MEUCIQDiV8dGOGQkujYQGic8Un44ZcU0wkxVpphnl6VQrIRRcwIgM75NixNvPnrUXFM5YW+uaRqdBhS2JNpTEgd5bDT.Lpw=/ZHUxNjpXaW5kb3dzQmluYXJ5VXJsdTUyOmh0dHBzOi8vZG93bmxvYWQubmluZS1jaHJvbmljbGVzLmNvbS92MjIvV2luZG93cy56aXB1MTQ6bWFjT1NCaW5hcnlVcmx1NTM6aHR0cHM6Ly9kb3dubG9hZC5uaW5lLWNocm9uaWNsZXMuY29tL3YyMi9tYWNPUy50YXIuZ3p1OTp0aW1lc3RhbXB1MjA6MjAyMC0wNS0xMVQwNTozMDowMFpl",
    GenesisBlockPath: "https://9c-test.s3.ap-northeast-2.amazonaws.com/genesis-block-9c-beta-2",
    RpcServer: true,
    RpcListenHost: "0.0.0.0",
    RpcListenPort: 6967,
    MinimumDifficulty: 5000,
    SwarmHost: "0.0.0.0",
    SwarmPort: 6968,
    StoreType: "rocksdb",
    StorePath: ".blockstore",
    NoMiner: true,
    TrustedAppProtocolVersionSigners: ["02a5e2811a9bfa4eec274e806debd622c53702bce39a809918563a4cf34189ff85"],
}
