export type KeyId = string;
export type Address = string;
export type PrivateKey = string;
export type ProtectedPrivateKey = {
  keyId: KeyId;
  address: Address;
  path: string;
};
export type RawPrivateKey = { privateKey: string; address: Address };
