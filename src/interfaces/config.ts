export interface IConfig {
  ActivationCodeUrl: string;
  AppProtocolVersion: string;
  ConfigVersion: number;
  DataProviderUrl: string | undefined;
  DiscordUrl: string;
  DownloadBaseURL: string;
  GuideDocsUrl: string;
  LaunchPlayer: boolean;
  Locale: string;
  LogSizeBytes: number;
  Network: string;
  MarketServiceUrl: string;
  NoTrustedStateValidators: boolean;
  OnboardingPortalUrl: string;
  RemoteNodeList: string[];
  Sentry: boolean;
  SwapAddress: string | undefined;
  PatronAddress: string | undefined;
  TrustedAppProtocolVersionSigners: string[];
  RemoteClientStaleTipLimit: number;
  UnitySentrySampleRate: number;
  UseRemoteHeadless: boolean;
  UseUpdate: boolean;
}
