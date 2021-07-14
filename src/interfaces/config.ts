export interface IElectronStore {
  ConfigVersion: number;
  AppProtocolVersion: string;
  SnapshotPaths: string[];
  GenesisBlockPath: string;
  MinimumDifficulty: number;
  StoreType: string;
  NoMiner: boolean;
  TrustedAppProtocolVersionSigners: string[];
  IceServerStrings: string[];
  PeerStrings: string[];
  BlockchainStoreDirParent: string;
  BlockchainStoreDirName: string;
  Locale: string;
  Workers: number;
  Confirmations: number;
  HeadlessArgs: string[];
  Mixpanel: boolean;
  Sentry: boolean;
  MuteTeaser: boolean;
  AwsAccessKey: string | undefined;
  AwsSecretKey: string | undefined;
  AwsRegion: string | undefined;
  DataProviderUrl: string | undefined;
}
