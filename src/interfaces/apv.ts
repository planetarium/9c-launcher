export interface IExtra {
  [key: string]: unknown;
}

export interface ISimpleApv {
  raw: string;
  version: number;
  extra: IExtra;
}
export interface IApv extends ISimpleApv {
  signature: string;
  signer: string;
}
