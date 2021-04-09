export interface IApv {
  version: number;
  signature: string;
  signer: string;
  extra: { [key: string]: string };
}
