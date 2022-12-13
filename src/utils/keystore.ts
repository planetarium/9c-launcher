import fs from "fs";
import path from "path";
import { createAccount } from "@planetarium/account-raw";
import {
  listKeystoreFiles,
  sanitizeKeypath,
  V3Keystore,
  rawPrivateKeyToV3,
} from "@planetarium/account-local";
import { deriveAddress } from "@planetarium/sign";
import {
  Address,
  PrivateKey,
  ProtectedPrivateKey,
} from "src/interfaces/keystore";

export function listPPK() {
  return listKeystoreFiles().map((keyId: string) => {
    const key: V3Keystore = JSON.parse(
      fs.readFileSync(path.resolve(sanitizeKeypath(), keyId), "utf8")
    );
    const ppk: ProtectedPrivateKey = {
      keyId: key.id,
      address: key.address,
      path: path.resolve(sanitizeKeypath(), keyId),
    };
    return ppk;
  });
}

export function removePPK(address: Address) {
  const keyList: ProtectedPrivateKey[] = listPPK();
  keyList.forEach((key) => {
    if (key.address.replace("0x", "") === address) {
      fs.rmSync(key.path);
    }
  });
}

export async function rawPPKToAddress(
  privateKeyHex: PrivateKey
): Promise<string> {
  return deriveAddress(createAccount(privateKeyHex));
}

export async function importV3(privateKey: PrivateKey, passphrase: string) {
  const v3 = rawPrivateKeyToV3(privateKey, passphrase);
  fs.writeFileSync(path.resolve(sanitizeKeypath(), v3.filename), v3.data);
}
