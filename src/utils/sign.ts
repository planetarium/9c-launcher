// This module is a temporary workaround for the lack of decoding functions in
// @planetarium/tx package.  See also:
// https://github.com/planetarium/libplanet/issues/3086
import { Account } from "@planetarium/account";
import {
  Dictionary,
  Key,
  Value,
  decode,
  encode,
  isDictionary,
  areKeysEqual,
  BencodexDictionary,
} from "@planetarium/bencodex";

const SIGNATURE_KEY = new Uint8Array([0x53]); // 'S'
const UPDATED_ADDRESSES = new Uint8Array([0x75]); // 'u'

export async function signTransactionDictionary(
  txDict: Dictionary,
  account: Account
): Promise<Dictionary> {
  const pairs: [Key, Value][] = [];
  for (const [key, value] of txDict.entries()) {
    if (areKeysEqual(key, SIGNATURE_KEY)) throw new Error("Already signed.");
    pairs.push([key, value]);
  }
  const sig = await account.sign(encode(txDict));
  pairs.push([SIGNATURE_KEY, sig.toBytes()]);
  return new BencodexDictionary(pairs);
}

export async function signTransactionBytes(
  txBytes: Uint8Array,
  account: Account
): Promise<Uint8Array> {
  const txDict = decode(txBytes);
  if (!isDictionary(txDict)) {
    throw new Error("Invalid transaction format");
  }
  const signedTxDict = await signTransactionDictionary(txDict, account);
  return encode(signedTxDict);
}

export async function signTransactionHex(
  txHex: string,
  account: Account
): Promise<string> {
  const txBytes = new Uint8Array(Buffer.from(txHex, "hex"));
  const signedTxBytes = await signTransactionBytes(txBytes, account);
  return Buffer.from(signedTxBytes).toString("hex");
}

export async function addUpdatedAddressesToTransactionHex(
  txHex: string,
  addresses: Key[]
): Promise<string> {
  const txBytes = Buffer.from(txHex, "hex");
  const txDict = decode(txBytes);
  const pairs: [Key, Value][] = [];

  if (!isDictionary(txDict)) {
    throw new Error("Invalid transaction format");
  }
  for (const [key, value] of txDict.entries()) {
    if (areKeysEqual(key, UPDATED_ADDRESSES)) pairs.push([key, addresses]);
    else pairs.push([key, value]);
  }
  return Buffer.from(encode(new BencodexDictionary(pairs))).toString("hex");
}
