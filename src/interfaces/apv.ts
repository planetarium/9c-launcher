export interface ISimpleApv {
  raw: string;
  version: number;
  extra: {
    player: string;
    launcher: string;
    [key: string]: unknown;
  };
}
export interface IApv extends ISimpleApv {
  signature: string;
  signer: string;
}
