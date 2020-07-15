export interface IElectronStore {
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
