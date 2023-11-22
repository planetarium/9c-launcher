import { keccak_256 } from "@noble/hashes/sha3";

function checkChainId(chainId?: number): void {
  if (chainId !== undefined && !(Number.isInteger(chainId) && chainId > 0)) {
    throw new TypeError("Bad chainId");
  }
}

function getHex(data: string): RegExpMatchArray | null {
  return typeof data === "string"
    ? data.match(/^(?:0x)?([0-9a-fA-F]{40})$/)
    : null;
}

function encodeInternal(
  address: string,
  parsed?: RegExpMatchArray | undefined | null,
  chainId?: number,
): string {
  checkChainId(chainId);
  parsed = parsed === undefined ? getHex(address) : parsed;
  if (!parsed) throw new TypeError("Bad address");

  const addressHex: string = parsed[1].toLowerCase();
  const forHash: string =
    chainId !== undefined ? `${chainId}0x${addressHex}` : addressHex;
  const checksum: Uint8Array = keccak_256.create().update(forHash).digest();

  return (
    "0x" +
    Array.from(checksum.subarray(0, 20))
      .map((byte, i) => {
        const ha: string = addressHex[2 * i];
        const hb: string = addressHex[2 * i + 1];
        return (
          ((byte & 0xf0) >= 0x80 ? ha.toUpperCase() : ha) +
          ((byte & 0x0f) >= 0x08 ? hb.toUpperCase() : hb)
        );
      })
      .join("")
  );
}

export function encode(address: string, chainId?: number): string {
  return encodeInternal(address, undefined, chainId);
}

export function verify(
  address: string,
  allowOneCase?: boolean,
  chainId?: number,
): boolean {
  checkChainId(chainId);
  const parsed: RegExpMatchArray | null = getHex(address);
  if (!parsed) return false;
  const oneCase: boolean =
    parsed[1] === parsed[1].toLowerCase() ||
    parsed[1] === parsed[1].toUpperCase();
  return (
    address.startsWith("0x") &&
    ((allowOneCase && oneCase) ||
      encodeInternal(address, parsed, chainId) === address)
  );
}
