export interface IConfig {
  ConfigVersion: number;
  AppProtocolVersion: string;
  GenesisBlockPath: string;
  TrustedAppProtocolVersionSigners: string[];
  BlockchainStoreDirParent: string;
  BlockchainStoreDirName: string;
  Locale: string;
  Workers: number;
  Confirmations: number;
  Mixpanel: boolean;
  Sentry: boolean;
  MuteTeaser: boolean;
  LogSizeBytes: number;
  Network: string;
  SwapAddress: string | undefined;
  LaunchPlayer: boolean;
  RemoteNodeList: string[];
  RemoteClientStaleTipLimit: number;
  DownloadBaseURL: string;
  UseUpdate: boolean;
  ActivationCodeUrl: string;
  KeystoreBackupDocumentationUrl: string;
  UnitySentrySampleRate: number;
  DiscordUrl: string;
  TrayOnClose: boolean;
  Planet: string;
  PlanetRegistryUrl: string;
  MeadPledgePortalUrl: string;
  SwapAvailabilityCheckServiceUrl: string;
  ThorSeasonBannerUrl: string | undefined;
  PlayerConfig: PlayerArguments;
}

export interface PlayerArguments {
  [key: string]: any;
}
