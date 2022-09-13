export interface ISimpleApv {
  version: number;
  extra: { [key: string]: string };
}
export interface IApv extends ISimpleApv {
  signature: string;
  signer: string;
}
