export interface IConfig {
  System: {
    AppProtocolVersion: string;
    ConfigVersion: number;
    Network: string;
    URL: {
      Client: {
        DataProviderUrl: string;
        GenesisBlockPath: string;
        IAPServiceHostUrl: string;
        MarketServiceUrl: string;
        OnboardingPortalUrl: string;
        PatrolRewardServiceUrl: string;
        SeasonPassServiceUrl: string;
        SwapAvailabilityCheckServiceUrl: string;
      };
      Launcher: {
        ActivationCodeUrl: string;
        AppleMarketUrl: string;
        DiscordUrl: string;
        GoogleMarketUrl: string;
        KeystoreBackupDocumentationUrl: string;
        MeadPledgePortalUrl: string;
        PlanetRegistryUrl: string;
      };
    };
    LogSizeBytes: number;
    Maintenance: boolean;
    RemoteNodeList: string[];
    SwapAddress: string;
    TrustedAppProtocolVersionSigners: string[];
    UnitySentrySampleRate: number;
  };
  User: {
    LaunchPlayer: boolean;
    Locale: string;
    Mixpanel: boolean;
    Planet: string;
    PlayerUpdateRetryCount: number;
    Sentry: boolean;
    TrayOnClose: boolean;
  };
}
