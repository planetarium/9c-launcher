interface StandaloneProperties {
  AppProtocolVersion: string;
  GenesisBlockPath: string;
  RpcServer: boolean;
  RpcListenHost: string;
  RpcListenPort: number;
  StoreType: string;
  StorePath: string;
  TrustedAppProtocolVersionSigners: string[];
  IceServerStrings: string[];
  PeerStrings: string[];
}
