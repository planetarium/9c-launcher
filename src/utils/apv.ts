import { encode, decode, BencodexDict } from "bencodex";

export function decodeAPV(token: string): BencodexDict | undefined {
  const extra = Buffer.from(token.split("/")[1], "hex");

  if (!extra.length) return;

  return decode(extra) as BencodexDict | undefined;
}

export function encodeExtra(extra: { [key: string]: string }): string {
  return encode(extra).toString("hex");
}

export function parseExtraData(raw: { [key: string]: string }): BencodexDict {
  const buffer = Buffer.from(encodeExtra(raw), "hex");
  console.log("peerVersionExtra (bytes):", buffer);
  const extra = decode(buffer) as BencodexDict;
  console.log("peerVersionExtra (decoded):", JSON.stringify(extra)); // Stringifies the JSON for extra clarity in the log

  return extra;
}

export function parseVersionNumber(apv: string): number {
  const [version] = apv.split("/");
  return parseInt(version, 10);
}
